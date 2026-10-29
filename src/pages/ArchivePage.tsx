import { useNavigate, useSearchParams } from 'react-router-dom';
import Archive from '@/components/Archive';
import Seo from '@/components/Seo';
import { DEFAULT_REGION, getRegion, isRegionId, regionPath } from '@/lib/regions';

/**
 * Archive page. The list itself lives in the `Archive` component; this page
 * only handles navigation into a selected day.
 */
export default function ArchivePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regionParam = searchParams.get('region');
  const region = isRegionId(regionParam) ? regionParam : DEFAULT_REGION;
  const regionConfig = getRegion(region);

  return (
    <>
      <Seo
        title="Archive"
        description="Replay any of the last thirty days of USA GeoArena and try to beat the score you set the first time round."
        path="/archive"
      />
      <Archive
        region={region}
        onBack={() => navigate('/')}
        onSelectDate={(date) => navigate(`${regionPath(region)}?date=${date}`)}
        onSelectRegion={(next) => navigate(`/archive?region=${next}`)}
      />
    </>
  );
}
