// --- Singleton Audio Context Management ---
// Manages a single AudioContext instance to ensure it's created only once
// and can be unlocked by user interaction to allow autoplay.
let audioContext: AudioContext | null = null;
export const getAudioContext = (): AudioContext | null => {
    if (typeof window !== 'undefined' && !audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

export const unlockAudioContext = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
};

// Initialize the context as soon as the module loads and add unlock listeners
if (typeof window !== 'undefined') {
    getAudioContext();
    document.addEventListener('click', unlockAudioContext, { once: true });
    document.addEventListener('keydown', unlockAudioContext, { once: true });
}


export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Decodes and plays a base64 audio string.
 * @param base64 The base64 encoded audio data.
 * @param ctx The AudioContext to use for playback.
 */
export const playBase64Audio = async (base64: string, ctx: AudioContext): Promise<void> => {
    try {
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
        const decoded = decode(base64);
        const buffer = await decodeAudioData(decoded, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
    } catch (error) {
        console.error("Failed to play audio:", error);
    }
};