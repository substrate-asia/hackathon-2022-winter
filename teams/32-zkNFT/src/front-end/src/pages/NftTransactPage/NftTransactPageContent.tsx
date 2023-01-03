// @ts-nocheck
import Svgs from 'resources/icons';
import SendFromForm from './SendFromForm';
import SendToForm from './SendToForm';

const NftTransactPageContent = () => {

  return (
      <div className="2xl:inset-x-0 mt-4 justify-center min-h-full flex items-center pb-2">
        <div className="p-8 bg-secondary rounded-3xl">
          <SendFromForm />
          <img
            className="mx-auto pt-1 pb-4"
            src={Svgs.ArrowDownIcon}
            alt="switch-icon"
          />
          <SendToForm />
        </div>
      </div>
  );
};

export default NftTransactPageContent;
