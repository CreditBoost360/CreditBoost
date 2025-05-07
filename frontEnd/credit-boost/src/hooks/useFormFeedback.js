export const useFormFeedback = () => {
  const triggerHaptic = (type = 'error') => {
    // Check if the device supports vibration
    if (!window.navigator?.vibrate) return;

    switch (type) {
      case 'error':
        // Two short vibrations for error
        window.navigator.vibrate([50, 30, 50]);
        break;
      case 'success':
        // One longer vibration for success
        window.navigator.vibrate(100);
        break;
      case 'warning':
        // One short vibration for warning
        window.navigator.vibrate(50);
        break;
      default:
        window.navigator.vibrate(50);
    }
  };

  const getAriaAttributes = (state) => {
    if (!state) return {};

    return {
      'aria-invalid': state.isInvalid || undefined,
      'aria-errormessage': state.errorId,
      'aria-describedby': state.descriptionId,
    };
  };

  const getFeedbackStyles = (state) => {
    if (!state) return '';

    return state.isInvalid 
      ? 'border-destructive focus:ring-destructive/30 animate-shake'
      : state.isValid
        ? 'border-success focus:ring-success/30'
        : '';
  };

  return {
    triggerHaptic,
    getAriaAttributes,
    getFeedbackStyles,
  };
};