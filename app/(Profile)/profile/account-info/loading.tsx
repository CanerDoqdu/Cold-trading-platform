import { ProfileSkeleton } from '../ProfileNav';
import ProfileNav from '../ProfileNav';

export default function AccountInfoLoading() {
  return (
    <ProfileNav>
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-gray-800 rounded" />
        <div className="h-4 w-64 bg-gray-800 rounded" />
        <div className="space-y-4 mt-8">
          <div className="h-16 bg-gray-800 rounded-xl" />
          <div className="h-16 bg-gray-800 rounded-xl" />
          <div className="h-16 bg-gray-800 rounded-xl" />
          <div className="h-16 bg-gray-800 rounded-xl" />
        </div>
        <div className="h-48 bg-gray-800 rounded-xl mt-8" />
      </div>
    </ProfileNav>
  );
}
