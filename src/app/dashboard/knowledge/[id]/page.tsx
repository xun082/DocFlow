import KnowledgeDocumentList from '../_components/KnowledgeDocumentList';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KnowledgeDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <KnowledgeDocumentList knowledgeId={Number(id)} />
    </div>
  );
}
