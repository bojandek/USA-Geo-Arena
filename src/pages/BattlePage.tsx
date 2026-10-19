import { useNavigate } from 'react-router-dom';
import BattleMode from '@/components/BattleMode';

export default function BattlePage() {
  const navigate = useNavigate();
  return <BattleMode onExit={() => navigate('/')} />;
}
