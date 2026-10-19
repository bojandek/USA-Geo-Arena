import { useNavigate } from 'react-router-dom';
import PracticeMode from '@/components/PracticeMode';

export default function PracticePage() {
  const navigate = useNavigate();
  return <PracticeMode onBack={() => navigate('/')} />;
}
