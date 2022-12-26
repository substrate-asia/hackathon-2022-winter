// @ts-nocheck
import CreateCollection from './CreateCollection';
import CreateItem from './CreateItem';

const NftCreatePageContent = () => {

  return (
      <div className="2xl:inset-x-0 mt-4 justify-center min-h-full flex items-center pb-2">
        <div className="p-8 bg-secondary rounded-3xl">
          <CreateCollection/>
          <CreateItem/>
        </div>
      </div>
  );
};

export default NftCreatePageContent;
