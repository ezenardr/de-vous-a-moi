import AppLayout from '@/components/layouts/AppLayout';
import {CategoriesSkeleton} from '@/components/ui/skeletons';

export default function Loading(){
  return <AppLayout><CategoriesSkeleton/></AppLayout>;
}
