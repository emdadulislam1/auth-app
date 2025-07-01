import { ArrowPathIcon } from '@heroicons/react/24/outline';

const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <ArrowPathIcon className="animate-spin h-8 w-8 text-blue-500" />
  </div>
);

export default Spinner; 