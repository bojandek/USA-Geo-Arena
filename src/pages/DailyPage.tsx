import { useNavigate, useSearchParams } from 'react-router-dom';
import DailyChallenge from '@/components/DailyChallenge';

/**
 * Daily challenge page.
 * The optional `?date=YYYY-MM-DD` parameter replays an archived day.
 */
export default function DailyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date');

  return (
    <DailyChallenge
      selectedDate={date}
      onBack={() => navigate(date ? '/archive' : '/')}
    />
  );
}
