import Segmented from './Segmented.jsx';

const OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const HINTS = {
  easy: 'Plays random moves.',
  medium: 'Takes wins and blocks yours.',
  hard: 'Unbeatable minimax. Best you can do is draw.',
};

export default function DifficultySelector({ value, onChange }) {
  return (
    <div>
      <Segmented id="difficulty" label="Difficulty" value={value} options={OPTIONS} onChange={onChange} />
      <p className="mt-2 text-xs text-muted">{HINTS[value]}</p>
    </div>
  );
}
