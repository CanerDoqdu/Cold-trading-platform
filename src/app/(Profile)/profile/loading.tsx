import { ProfileSkeleton } from './ProfileNav';
import ProfileNav from './ProfileNav';

export default function ProfileLoading() {
  return (
    <ProfileNav>
      <ProfileSkeleton />
    </ProfileNav>
  );
}
