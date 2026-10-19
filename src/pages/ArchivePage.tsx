import { useNavigate } from 'react-router-dom';
import Archive from '@/components/Archive';

/**
 * Archive page. The list itself lives in the `Archive` component; this page
 * only handles navigation into a selected day.
 */
export default function ArchivePage() {
  const navigate = useNavigate();

  return (
    <Archive
      onBack={() => navigate('/')}
      onSelectDate={(date) => navigate(`/daily?date=${date}`)}
    />
  );
}
