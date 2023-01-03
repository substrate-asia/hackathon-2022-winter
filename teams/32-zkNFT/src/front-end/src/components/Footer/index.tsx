import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTwitter,
  faDiscord,
  faTelegram,
  faMedium
} from '@fortawesome/free-brands-svg-icons';
import {
  HeartSvg
} from 'resources/svgs';

const CalamariFooter = () => {
  return (
    <div className="mt-16 flex justify-between gap-20 bg-primary py-10 px-28">
      <div>
        <div className="text-2xl text-black dark:text-white">
          Calamari Network
        </div>
        <div className="my-6 text-xl text-secondary">
          Calamari Network is a private layer built for the entire Kusama
          ecosystem. Built on the substrate framework, Calamari Network is
          natively compatible with other projects and parachain assets including
          wrapped major cryptoassets.
        </div>
        <div className="flex items-center text-xl text-secondary">
          <span>Made with</span>
          <HeartSvg className="mx-3 inline w-5 align-middle" />
          <span>by </span>
          <span
            className="cursor-pointer text-black dark:text-white duration-200 hover:text-secondary dark:hover:text-secondary"
            onClick={() => window.open('https://p0xeidon.xyz/')}
          >
            &nbsp;P0xeidon Labs
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-secondary"
          onClick={() =>
            window.open(
              'https://twitter.com/CalamariNetwork?s=20&t=WnN25-sBtGkQwJmZKoMuMQ'
            )
          }
        >
          <FontAwesomeIcon
            icon={faTwitter}
            className="w-6 duration-200 transform hover:scale-125 text-black dark:text-white text-xl"
          />
        </div>
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-secondary"
          onClick={() => window.open('https://discord.gg/PRDBTChSsF')}
        >
          <FontAwesomeIcon
            icon={faDiscord}
            className="w-6 duration-200 transform hover:scale-125 text-black dark:text-white text-xl"
          />
        </div>
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-secondary text-black"
          onClick={() => window.open('https://t.me/mantanetworkofficial')}
        >
          <FontAwesomeIcon
            icon={faTelegram}
            className="w-6 duration-200 transform hover:scale-125 text-black dark:text-white text-xl"
          />
        </div>
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-secondary"
          onClick={() => window.open('https://mantanetwork.medium.com/')}
        >
          <FontAwesomeIcon
            icon={faMedium}
            className="w-6 duration-200 transform hover:scale-125 text-black dark:text-white text-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default CalamariFooter;
