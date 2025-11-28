import { useState, useRef, useEffect, useCallback } from 'react';

interface EditableTitleProps {
  /** Current title value */
  value: string;
  /** Called when title changes */
  onChange: (value: string) => void;
  /** Placeholder when empty */
  placeholder?: string;
}

/**
 * Editable title component
 * Click to edit, press Enter or blur to save
 */
export function EditableTitle({
  value,
  onChange,
  placeholder = 'Click to add title',
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync local value when prop changes (while not editing)
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value);
    }
  }, [value, isEditing]);

  const handleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const commitValue = useCallback(() => {
    onChange(localValue.trim());
    setIsEditing(false);
  }, [localValue, onChange]);

  const handleBlur = useCallback(() => {
    commitValue();
  }, [commitValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitValue();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLocalValue(value);
        setIsEditing(false);
      }
    },
    [commitValue, value]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  if (isEditing) {
    return (
      <div className="title-area">
        <input
          ref={inputRef}
          type="text"
          className="title-input"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Edit title"
        />
      </div>
    );
  }

  return (
    <div className="title-area">
      <span
        className="title"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={value || placeholder}
      >
        {value || placeholder}
      </span>
    </div>
  );
}
