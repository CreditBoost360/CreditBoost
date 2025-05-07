/**
 * Sunny Payment Gateway - Asynchronous Transaction Processor
 * 
 * Implements asynchronous processing for high transaction volumes
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to queue directory
const QUEUE_DIR = path.join(__dirname, '../../db/queue');

// Create a global event emitter
const eventEmitter = new EventEmitter();

// Set max listeners to avoid memory leaks
eventEmitter.setMaxListeners(100);

// Queue status
const queueStatus = {
  processing: false,
  pendingCount: 0,
  processedCount: 0,
  failedCount: 0,
  workers: 0
};

/**
 * Initialize async processor
 * 
 * @returns {Promise<void>}
 */
export async function initializeAsyncProcessor() {
  try {
    // Create queue directory if it doesn't exist
    try {
      await fs.access(QUEUE_DIR);
    } catch (error) {
      await fs.mkdir(QUEUE_DIR, { recursive: true });
    }
    
    // Create subdirectories
    const subdirs = ['pending', 'processing', 'completed', 'failed'];
    
    for (const dir of subdirs) {
      const dirPath = path.join(QUEUE_DIR, dir);
      try {
        await fs.access(dirPath);
      } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }
    
    console.log('Asynchronous processor initialized');
    
    // Start processing pending tasks
    startProcessing();
  } catch (error) {
    console.error('Failed to initialize async processor:', error);
    throw new Error('Failed to initialize async processor');
  }
}

/**
 * Queue a task for asynchronous processing
 * 
 * @param {string} taskType - Type of task
 * @param {Object} taskData - Task data
 * @param {Object} options - Task options
 * @returns {Promise<string>} Task ID
 */
export async function queueTask(taskType, taskData, options = {}) {
  try {
    // Generate task ID
    const taskId = crypto.randomUUID();
    
    // Create task object
    const task = {
      id: taskId,
      type: taskType,
      data: taskData,
      options: {
        priority: options.priority || 5, // 1-10, higher is more important
        retryCount: 0,
        maxRetries: options.maxRetries || 3,
        createdAt: new Date().toISOString()
      }
    };
    
    // Write task to pending directory
    const taskPath = path.join(QUEUE_DIR, 'pending', `${taskId}.json`);
    await fs.writeFile(taskPath, JSON.stringify(task, null, 2));
    
    // Update queue status
    queueStatus.pendingCount++;
    
    // Emit event
    eventEmitter.emit('task:queued', task);
    
    // Trigger processing if not already running
    if (!queueStatus.processing) {
      startProcessing();
    }
    
    return taskId;
  } catch (error) {
    console.error('Failed to queue task:', error);
    throw new Error('Failed to queue task');
  }
}

/**
 * Start processing tasks
 * 
 * @returns {Promise<void>}
 */
async function startProcessing() {
  // If already processing, return
  if (queueStatus.processing) {
    return;
  }
  
  // Set processing flag
  queueStatus.processing = true;
  
  try {
    // Get pending tasks
    const pendingDir = path.join(QUEUE_DIR, 'pending');
    const files = await fs.readdir(pendingDir);
    
    if (files.length === 0) {
      // No pending tasks
      queueStatus.processing = false;
      return;
    }
    
    // Sort files by priority (read each file to get priority)
    const tasks = [];
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(pendingDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const task = JSON.parse(content);
      
      tasks.push({
        id: task.id,
        priority: task.options.priority,
        filePath
      });
    }
    
    // Sort by priority (higher first)
    tasks.sort((a, b) => b.priority - a.priority);
    
    // Process tasks in parallel with concurrency limit
    const concurrencyLimit = 10;
    const activeTasks = [];
    
    for (let i = 0; i < Math.min(concurrencyLimit, tasks.length); i++) {
      activeTasks.push(processTask(tasks[i].id, tasks[i].filePath));
    }
    
    // Wait for all tasks to complete
    await Promise.all(activeTasks);
    
    // Check if there are more tasks
    const remainingFiles = await fs.readdir(pendingDir);
    
    if (remainingFiles.length > 0) {
      // More tasks to process
      setImmediate(startProcessing);
    } else {
      // No more tasks
      queueStatus.processing = false;
    }
  } catch (error) {
    console.error('Error processing tasks:', error);
    queueStatus.processing = false;
  }
}

/**
 * Process a task
 * 
 * @param {string} taskId - Task ID
 * @param {string} filePath - Path to task file
 * @returns {Promise<void>}
 */
async function processTask(taskId, filePath) {
  try {
    // Read task file
    const content = await fs.readFile(filePath, 'utf8');
    const task = JSON.parse(content);
    
    // Move to processing directory
    const processingPath = path.join(QUEUE_DIR, 'processing', `${taskId}.json`);
    await fs.rename(filePath, processingPath);
    
    // Update queue status
    queueStatus.pendingCount--;
    queueStatus.workers++;
    
    // Emit event
    eventEmitter.emit('task:processing', task);
    
    try {
      // Process task based on type
      let result;
      
      switch (task.type) {
        case 'payment':
          result = await processPaymentTask(task.data);
          break;
        case 'refund':
          result = await processRefundTask(task.data);
          break;
        case 'tokenization':
          result = await processTokenizationTask(task.data);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      // Task completed successfully
      const completedTask = {
        ...task,
        result,
        completedAt: new Date().toISOString()
      };
      
      // Move to completed directory
      const completedPath = path.join(QUEUE_DIR, 'completed', `${taskId}.json`);
      await fs.writeFile(completedPath, JSON.stringify(completedTask, null, 2));
      
      // Delete from processing directory
      await fs.unlink(processingPath);
      
      // Update queue status
      queueStatus.workers--;
      queueStatus.processedCount++;
      
      // Emit event
      eventEmitter.emit('task:completed', completedTask);
    } catch (error) {
      // Task failed
      console.error(`Task ${taskId} failed:`, error);
      
      // Increment retry count
      task.options.retryCount++;
      
      if (task.options.retryCount < task.options.maxRetries) {
        // Retry task
        const pendingPath = path.join(QUEUE_DIR, 'pending', `${taskId}.json`);
        await fs.writeFile(pendingPath, JSON.stringify(task, null, 2));
        
        // Delete from processing directory
        await fs.unlink(processingPath);
        
        // Update queue status
        queueStatus.workers--;
        queueStatus.pendingCount++;
        
        // Emit event
        eventEmitter.emit('task:retry', task);
      } else {
        // Max retries reached, move to failed directory
        const failedTask = {
          ...task,
          error: {
            message: error.message,
            stack: error.stack
          },
          failedAt: new Date().toISOString()
        };
        
        const failedPath = path.join(QUEUE_DIR, 'failed', `${taskId}.json`);
        await fs.writeFile(failedPath, JSON.stringify(failedTask, null, 2));
        
        // Delete from processing directory
        await fs.unlink(processingPath);
        
        // Update queue status
        queueStatus.workers--;
        queueStatus.failedCount++;
        
        // Emit event
        eventEmitter.emit('task:failed', failedTask);
      }
    }
  } catch (error) {
    console.error(`Error processing task ${taskId}:`, error);
    queueStatus.workers--;
  }
}

/**
 * Process payment task
 * 
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Processing result
 */
async function processPaymentTask(data) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In a real implementation, this would call the payment gateway
  return {
    success: true,
    transactionId: crypto.randomUUID(),
    status: 'completed',
    processorResponse: {
      authorizationCode: crypto.randomBytes(6).toString('hex').toUpperCase(),
      processorTransactionId: `PROC_${crypto.randomBytes(8).toString('hex')}`,
      processorName: 'SunnyProcessor'
    }
  };
}

/**
 * Process refund task
 * 
 * @param {Object} data - Refund data
 * @returns {Promise<Object>} Processing result
 */
async function processRefundTask(data) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // In a real implementation, this would call the payment gateway
  return {
    success: true,
    refundId: crypto.randomUUID(),
    amount: data.amount,
    currency: data.currency,
    originalTransactionId: data.transactionId
  };
}

/**
 * Process tokenization task
 * 
 * @param {Object} data - Tokenization data
 * @returns {Promise<Object>} Processing result
 */
async function processTokenizationTask(data) {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // In a real implementation, this would call the payment gateway
  return {
    success: true,
    token: crypto.randomBytes(16).toString('hex'),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    type: data.type
  };
}

/**
 * Get task status
 * 
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Task status
 */
export async function getTaskStatus(taskId) {
  try {
    // Check each directory for the task
    const directories = ['pending', 'processing', 'completed', 'failed'];
    
    for (const dir of directories) {
      const filePath = path.join(QUEUE_DIR, dir, `${taskId}.json`);
      
      try {
        await fs.access(filePath);
        
        // Task found, read it
        const content = await fs.readFile(filePath, 'utf8');
        const task = JSON.parse(content);
        
        return {
          id: task.id,
          type: task.type,
          status: dir,
          createdAt: task.options.createdAt,
          completedAt: task.completedAt,
          failedAt: task.failedAt,
          retryCount: task.options.retryCount,
          result: task.result,
          error: task.error
        };
      } catch (error) {
        // Task not found in this directory
      }
    }
    
    // Task not found
    return null;
  } catch (error) {
    console.error(`Failed to get task status for ${taskId}:`, error);
    throw new Error('Failed to get task status');
  }
}

/**
 * Get queue statistics
 * 
 * @returns {Object} Queue statistics
 */
export function getQueueStats() {
  return {
    ...queueStatus,
    timestamp: new Date().toISOString()
  };
}

/**
 * Subscribe to task events
 * 
 * @param {string} event - Event name
 * @param {Function} callback - Event callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTaskEvents(event, callback) {
  eventEmitter.on(event, callback);
  
  // Return unsubscribe function
  return () => {
    eventEmitter.off(event, callback);
  };
}

/**
 * Retry failed task
 * 
 * @param {string} taskId - Task ID
 * @returns {Promise<boolean>} Whether task was retried
 */
export async function retryFailedTask(taskId) {
  try {
    const failedPath = path.join(QUEUE_DIR, 'failed', `${taskId}.json`);
    
    try {
      await fs.access(failedPath);
    } catch (error) {
      // Task not found
      return false;
    }
    
    // Read task
    const content = await fs.readFile(failedPath, 'utf8');
    const task = JSON.parse(content);
    
    // Reset retry count
    task.options.retryCount = 0;
    delete task.error;
    delete task.failedAt;
    
    // Move to pending directory
    const pendingPath = path.join(QUEUE_DIR, 'pending', `${taskId}.json`);
    await fs.writeFile(pendingPath, JSON.stringify(task, null, 2));
    
    // Delete from failed directory
    await fs.unlink(failedPath);
    
    // Update queue status
    queueStatus.failedCount--;
    queueStatus.pendingCount++;
    
    // Emit event
    eventEmitter.emit('task:retry', task);
    
    // Trigger processing if not already running
    if (!queueStatus.processing) {
      startProcessing();
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to retry task ${taskId}:`, error);
    throw new Error('Failed to retry task');
  }
}