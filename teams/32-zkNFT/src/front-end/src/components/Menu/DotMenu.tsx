// @ts-nocheck
import { themeType } from 'constants/ThemeConstants';
import { useConfig } from 'contexts/configContext';
import { ThemeContext } from 'contexts/themeContext';
import React, { useContext, useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import PropTypes from 'prop-types';
import {
  faDiscord,
  faMedium,
  faTelegram,
  faTwitter
} from '@fortawesome/free-brands-svg-icons';
import {
  faBook,
  faCircleQuestion,
  faEllipsis,
  faFaucetDrip,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const MenuItem = ({link, name, icon}) => (
  <a
    className="flex items-center justify-between text-sm p-1.5 font-mono font-medium cursor-pointer hover:font-bold"
    href={link}
    target="_blank"
    rel="noopener noreferrer"
  >
    <div className="w-10/12 h-5 text-black hover:text-link dark:text-white dark:hover:text-link">
      {name}
    </div>
    <FontAwesomeIcon
      icon={icon}
      className="w-4 h-5 items-center text-xl text-black hover:text-link dark:text-white dark:hover:text-link"
    />
  </a>
);

MenuItem.propTypes = {
  link: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.any
};

const ChangeThemeMenuItem = ({theme, setTheme, name, icon}) => (
  <div
    className="flex items-center justify-between text-sm p-1.5 font-mono font-medium cursor-pointer hover:font-bold"
    onClick={() => {
      setTheme(theme);
    }}
  >
    <div className="w-10/12 h-5 text-black hover:text-link dark:text-white dark:hover:text-link">
      {name}
    </div>
    <FontAwesomeIcon
      icon={icon}
      className="items-center w-4 h-5 text-xl text-black dark:text-white dark:hover:text-link"
    />
  </div>
);

ChangeThemeMenuItem.propTypes = {
  theme: PropTypes.string,
  setTheme: PropTypes.func,
  name: PropTypes.string,
  icon: PropTypes.any
};

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);
  const config = useConfig();

  const links = {
    'DISCORD_URL': 'https://discord.gg/PRDBTChSsF',
    'TELEGRAM_URL': 'https://t.me/mantanetworkofficial',
    'MEDIUM_URL': 'https://mantanetwork.medium.com/',
    'CALAMARI_GUIDE_URL': 'https://docs.manta.network/docs/calamari/Staking/Overview',
    'CALAMARI_BUG_REPORT': 'https://discord.gg/PRDBTChSsF',
    'DOLPHIN_GUIDE_URL': 'https://docs.manta.network/docs/guides/DolphinPay',
    'DOLPHIN_BUG_REPORT': 'https://docs.google.com/forms/d/e/1FAIpQLScAIuDuztZoKHOlpJNC-9FlVdYJpMBLcztQCvT3IQ0FGe7GaA/viewform',
    'DOLPHIN_FAUCET_URL': 'https://docs.manta.network/docs/guides/DolphinPay#get-testnet-tokens',
  };

  const DotMenuContent = () => (
    <div className="w-48 h-68 flex-column flex-grow mt-3 bg-secondary rounded-3xl gap-y-4 p-5 absolute right-0 top-full z-50 border border-manta-gray">
      {theme === themeType.Dark ? <ChangeThemeMenuItem theme={themeType.Light} setTheme={setTheme} name={'Light Mode'} icon={faSun} /> : <ChangeThemeMenuItem theme={themeType.Dark} setTheme={setTheme} name={'Dark Mode'} icon={faMoon} />}
      <MenuItem link={config.TWITTER_URL} name={'Twitter'} icon={faTwitter}/>
      <MenuItem link={links.DISCORD_URL} name={'Discord'} icon={faDiscord}/>
      <MenuItem link={links.TELEGRAM_URL} name={'Telegram'} icon={faTelegram}/>
      <MenuItem link={links.MEDIUM_URL} name={'Medium'} icon={faMedium}/>
      {config.NETWORK_NAME === 'Dolphin' ? <MenuItem link={links.DOLPHIN_GUIDE_URL} name={'How to Guide'} icon={faBook}/> : null}
      {config.NETWORK_NAME === 'Dolphin' ? <MenuItem link={links.DOLPHIN_FAUCET_URL} name={'Faucet'} icon={faFaucetDrip}/> : null}
      {config.NETWORK_NAME === 'Dolphin' ? <MenuItem link={links.DOLPHIN_BUG_REPORT} name={'Bug Report'} icon={faCircleQuestion}/> : null}
      {config.NETWORK_NAME === 'Calamari' ? <MenuItem link={links.CALAMARI_GUIDE_URL} name={'How to Guide'} icon={faBook}/> : null}
      {config.NETWORK_NAME === 'Calamari' ? <MenuItem link={links.CALAMARI_BUG_REPORT} name={'Bug Report'} icon={faCircleQuestion}/> : null}
    </div>
  );

  return (
    <div className="relative">
      <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
        <div
          className="hover:bg-manta-gray dark:hover:bg-blue-900 bg-secondary flex gap-3 px-4 p-3 font-black cursor-pointer rounded-xl"
          onClick={() => {
            isOpen ? setIsOpen(false) : setIsOpen(true);
          }}
        >
          <FontAwesomeIcon
            icon={faEllipsis}
            className="text-xl text-black dark:text-white"
          />
        </div>
        {/* {isOpen && <DotMenuContent/>} */}
      </OutsideClickHandler>
    </div>
  );
};

export default Menu;
