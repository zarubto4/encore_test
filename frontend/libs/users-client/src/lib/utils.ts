export const parseError = (err: unknown): string => {
  if (typeof err === 'string') {
    return err;
  } else if (err instanceof Error) {
    return err.message;
  } else if (err && typeof err === 'object') {
    const errorsArray = (err as { errors?: unknown[] }).errors;
    if (Array.isArray(errorsArray) && errorsArray.length > 0) {
      const firstError = errorsArray[0] as { subject?: unknown; errorCode?: unknown };
      if (firstError && typeof firstError === 'object') {
        return `Subject: ${firstError.subject ?? 'N/A'}, Error Code: ${firstError.errorCode ?? 'N/A'}`;
      }
    }

    const badRequestError = (err as { error?: { code?: string; message?: string } }).error;
    if (badRequestError && badRequestError.code && badRequestError.message) {
      return `${badRequestError.code}: ${badRequestError.message}`;
    }

    const conflictError = (err as { error?: { error?: { code?: string; message?: string } } }).error;
    if (conflictError?.error?.code && conflictError?.error?.message) {
      return `${conflictError.error.code}: ${conflictError.error.message}`;
    }

    const appError = (err as { error?: { data: { error: string; message: string } } }).error;
    if (appError && appError?.data?.error) {
      return `${appError.data.error}: ${appError.data.message}`;
    }
    const apiError = (err as { error?: { error: string; status: string } }).error;
    if (apiError && apiError.error && apiError.status) {
      return `${apiError.status}: ${apiError.error}`;
    }

    if (
      (err as { data: unknown; error: unknown }).data === null &&
      JSON.stringify((err as { data: unknown; error: unknown }).error) === '{}'
    ) {
      return 'An unknown error occurred';
    }

    return JSON.stringify(err);
  } else {
    return 'An unknown error occurred';
  }
};
