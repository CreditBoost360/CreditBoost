import { create } from 'ipfs-http-client';
import dotenv from 'dotenv';

dotenv.config();

// Updated IPFS client configuration with proper authentication
const projectId = process.env.INFURA_PROJECT_ID || '';
const projectSecret = process.env.INFURA_PROJECT_SECRET || '';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth
    }
});

export const uploadToIPFS = async (file: Buffer): Promise<string> => {
    try {
        const result = await ipfs.add(file);
        return result.path;
    } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload to IPFS');
    }
};

export const retrieveFromIPFS = async (hash: string): Promise<Buffer> => {
    try {
        const stream = ipfs.cat(hash);
        let data = '';

        for await (const chunk of stream) {
            data += chunk.toString();
        }

        return Buffer.from(data);
    } catch (error) {
        console.error('Error retrieving from IPFS:', error);
        throw new Error('Failed to retrieve from IPFS');
    }
};