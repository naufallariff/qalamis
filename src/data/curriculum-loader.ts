// src/data/curriculum-loader.ts
import type { ModuleContent, RoadmapManifest } from '../types/curriculum';
import manifestData from './roadmap-manifest.json';

export const ROADMAP_MANIFEST = manifestData as RoadmapManifest;

const moduleLoaders = import.meta.glob<{ default: ModuleContent }>('./modules/mod-*.json');

// In-memory cache & in-flight promise deduplication
const moduleCache = new Map<number, ModuleContent>();
const inFlightRequests = new Map<number, Promise<ModuleContent>>();

export class ModuleLoadError extends Error {
    readonly moduleId: number;

    constructor(moduleId: number, message: string, cause?: unknown) {
        super(message, { cause });
        this.name = 'ModuleLoadError';
        this.moduleId = moduleId;
    }
}

export async function loadModuleById(moduleId: number): Promise<ModuleContent> {
    const cached = moduleCache.get(moduleId);
    if (cached) return cached;

    const existingRequest = inFlightRequests.get(moduleId);
    if (existingRequest) return existingRequest;

    const paddedId = String(moduleId).padStart(2, '0');
    const key = `./modules/mod-${paddedId}.json`;
    const loader = moduleLoaders[key];

    if (!loader) {
        throw new ModuleLoadError(
            moduleId,
            `Pos petualangan #${moduleId} belum tersedia di peta.`
        );
    }

    const request = loader()
        .then((loaded) => {
            const content = loaded.default;
            moduleCache.set(moduleId, content);
            inFlightRequests.delete(moduleId);
            return content;
        })
        .catch((error) => {
            inFlightRequests.delete(moduleId);
            throw new ModuleLoadError(
                moduleId,
                `Gagal memuat materi Modul #${moduleId}. Periksa koneksi lalu coba lagi.`,
                error
            );
        });

    inFlightRequests.set(moduleId, request);
    return request;
}

/**
 * Prefetch modul berikutnya secara senyap saat main-thread senggang
 * agar perpindahan pos di mobile terasa 0ms tanpa membebani Core Web Vitals.
 */
export function prefetchAdjacentModule(currentModuleId: number): void {
    const nextId = currentModuleId + 1;
    if (nextId > ROADMAP_MANIFEST.modules.length || moduleCache.has(nextId)) {
        return;
    }

    const runPrefetch = () => {
        void loadModuleById(nextId).catch(() => {
            // Abaikan error prefetch senyap; error ditangani saat user benar-benar membuka modul
        });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(runPrefetch, { timeout: 2000 });
    } else {
        setTimeout(runPrefetch, 400);
    }
}