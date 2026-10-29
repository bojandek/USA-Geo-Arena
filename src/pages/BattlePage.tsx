import { useNavigate } from 'react-router-dom';
import BattleMode from '@/components/BattleMode';
import Seo from '@/components/Seo';

export default function BattlePage() {
  const navigate = useNavigate();
  return (
    <>
      <Seo
        title="Battle Mode"
        description="Three rounds against a rival, played against the clock. The same ten questions, scored the same way - but the fastest answer wins the round."
        path="/battle"
      />
      <BattleMode onExit={() => navigate('/')} />
    </>
  );
}
