"use strict";
/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: process.env.BASEPATH,
    // TODO: below line is added to resolve twice event dispatch in the calendar reducer
    reactStrictMode: false,
    // Prevent bundling pdfkit so it can load font/data files from node_modules at runtime
    serverExternalPackages: ['pdfkit']
};
module.exports = nextConfig;
