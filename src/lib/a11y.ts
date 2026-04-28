/** Returns props for an accessible icon button */
export function iconButtonProps(label: string) {
  return {
    'aria-label': label,
    role: 'button' as const,
  };
}

/** Returns props for a form field with error */
export function fieldWithErrorProps(fieldId: string, errorId: string, hasError: boolean) {
  return {
    id: fieldId,
    'aria-describedby': hasError ? errorId : undefined,
    'aria-invalid': hasError ? (true as const) : undefined,
  };
}
