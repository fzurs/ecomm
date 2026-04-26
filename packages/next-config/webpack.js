const nextConfig = {
    webpack: (config, _) => ({
        ...config,
        watchOptions: {
            ...config.watchOptions,
            poll: 1000,
            aggregateTimeout: 300,
        },
    }),
}

export default nextConfig