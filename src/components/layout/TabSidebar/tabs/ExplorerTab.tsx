import { FileExplorer } from '@/components/FileExplorer';

const ExplorerTab = () => {
  return <FileExplorer onFileSelect={(file) => console.log('Selected file:', file.name)} />;
};

export default ExplorerTab;
