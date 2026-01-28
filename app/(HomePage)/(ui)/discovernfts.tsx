import React from 'react'
import nft from '@/public/images/nft.svg'
import Image from 'next/image'
import Link from 'next/link'

const DiscoverNfts = () => {
  return (
    <section className="bg-gradient-to-b from-gray-100 to-white dark:from-gray-950 dark:to-black py-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Text Content */}
        <div className="text-gray-900 dark:text-white max-w-xl lg:w-1/2">
          <span className="text-emerald-500 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-4 block">
            NFT Marketplace
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-gray-900 dark:text-white">
            Discover, collect, and sell{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-400 dark:to-emerald-300">
              extraordinary NFTs
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
            Explore a world of unique digital art and collectibles. 
            Buy, sell, and trade NFTs from the world's top creators and artists.
          </p>
          
          {/* Stats */}
          <div className="flex gap-8 mb-8">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">50K+</p>
              <p className="text-gray-500 text-sm">NFTs Listed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">10K+</p>
              <p className="text-gray-500 text-sm">Artists</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">$2M+</p>
              <p className="text-gray-500 text-sm">Volume</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Link 
              href="/nftrankings"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-bold py-3 px-8 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
            >
              Explore NFTs
            </Link>
            <button className="border border-gray-300 dark:border-gray-700 hover:border-emerald-500/50 text-gray-900 dark:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/20">
              Create NFT
            </button>
          </div>
        </div>
        
        {/* NFT Image */}
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image
              src={nft} 
              alt="NFT Showcase"
              className="rounded-2xl object-cover relative z-10 transition-transform duration-500 group-hover:scale-105"
              width={500}
              height={500}
              unoptimized
              style={{ width: '500px', height: '500px' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default DiscoverNfts