import CollectionTemplate from "../../components/CollectionTemplate";

const NewArrivals = () => {
  return (
    <CollectionTemplate
      title="New Arrivals"
      description="Latest additions to our collection"
      category="all"
      sortBy="date"
    />
  );
};

export default NewArrivals;