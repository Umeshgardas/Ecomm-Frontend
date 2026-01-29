import CollectionTemplate from "../../components/CollectionTemplate";

const Sale = () => {
  return (
    <CollectionTemplate
      title="Sale"
      description="Don't miss out on these amazing deals"
      category="all"
      onSale={true}
    />
  );
};

export default Sale;