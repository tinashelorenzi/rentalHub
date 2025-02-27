// src/hooks/useFormData.ts
import { useState, useCallback } from 'react';

type FormErrors<T> = Partial<Record<keyof T, string>>;

interface FormDataState<T> {
  values: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
}

interface UseFormDataReturn<T> {
  values: T;
  errors: FormErrors<T>;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setErrors: (errors: FormErrors<T>) => void;
  clearErrors: () => void;
  reset: () => void;
  handleSubmit: (callback: (values: T) => Promise<void> | void) => (e: React.FormEvent) => void;
}

export function useFormData<T extends Record<string, any>>(
  initialValues: T
): UseFormDataReturn<T> {
  const [state, setState] = useState<FormDataState<T>>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
  });

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        [field]: value,
      },
    }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values,
        ...newValues,
      },
    }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setState(prevState => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [field]: error,
      },
    }));
  }, []);

  const setErrors = useCallback((errors: FormErrors<T>) => {
    setState(prevState => ({
      ...prevState,
      errors,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      errors: {},
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      isSubmitting: false,
    });
  }, [initialValues]);

  const handleSubmit = useCallback(
    (callback: (values: T) => Promise<void> | void) => async (e: React.FormEvent) => {
      e.preventDefault();
      setState(prevState => ({
        ...prevState,
        isSubmitting: true,
      }));

      try {
        await callback(state.values);
      } finally {
        setState(prevState => ({
          ...prevState,
          isSubmitting: false,
        }));
      }
    },
    [state.values]
  );

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    setValue,
    setValues,
    setError,
    setErrors,
    clearErrors,
    reset,
    handleSubmit,
  };
}