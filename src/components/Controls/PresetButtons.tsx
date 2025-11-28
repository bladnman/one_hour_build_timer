import type { PresetTime } from '../../types';

interface PresetButtonsProps {
  /** List of preset times to display */
  presets: PresetTime[];
  /** Called when a preset is selected */
  onSelect: (seconds: number) => void;
}

/**
 * Preset time selection buttons
 */
export function PresetButtons({ presets, onSelect }: PresetButtonsProps) {
  return (
    <div className="preset-buttons">
      {presets.map((preset) => (
        <button
          key={preset.seconds}
          className="preset-button"
          onClick={() => onSelect(preset.seconds)}
          aria-label={`Set timer to ${preset.label}`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
