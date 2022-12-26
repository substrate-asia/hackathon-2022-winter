// @ts-nocheck
import ViewNfts from './ViewNfts';

const NftViewPageContent = () => {

  return (
      <div className="2xl:inset-x-0 mt-4 justify-center min-h-full flex items-center pb-2">
        <div className="p-8 bg-secondary rounded-3xl w-4/12">
          <ViewNfts/>
        </div>
      </div>
  );
};

export default NftViewPageContent;
