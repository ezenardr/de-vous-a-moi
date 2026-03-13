import AppLayout from '@/components/layouts/AppLayout';
import {ReadsSkeleton} from '@/components/ui/skeletons';

export default function Loading(){
  return <AppLayout><ReadsSkeleton/></AppLayout>;
}
