import SierraEstatesBrochure from "@/components/Proposals/SierraEstatesBrochure";

export const metadata = {
  title: "Property Proposal | Sierra Estates",
  description: "Generate luxury PDF brochures for Sierra Estates properties.",
};

export default function BrochureDynamicPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <SierraEstatesBrochure propertyId={params.id} />
    </main>
  );
}
