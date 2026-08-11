import Sidebar from '../components/Sidebar';
import MockOA from '../components/MockOA';

export default function MockOAPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <MockOA />
      </div>
    </div>
  );
}