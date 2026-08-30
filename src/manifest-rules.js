(function exposeManifestRules(root, factory) {
  const rules = factory();
  if (typeof module === 'object' && module.exports) module.exports = rules;
  if (root) root.VidoGoManifestRules = rules;
}(typeof globalThis === 'object' ? globalThis : this, () => {
  function positiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  }

  function resolveHttpUrl(value, baseUrl) {
    try {
      const resolved = new URL(String(value || '').trim(), baseUrl);
      return ['http:', 'https:'].includes(resolved.protocol) ? resolved.href : null;
    } catch {
      return null;
    }
  }

  function parseAttributeList(line) {
    const source = String(line || '').replace(/^[^:]*:/, '');
    const attributes = {};
    let index = 0;
    while (index < source.length) {
      while (index < source.length && (source[index] === ',' || /\s/.test(source[index]))) index += 1;
      const nameStart = index;
      while (index < source.length && /[A-Za-z0-9-]/.test(source[index])) index += 1;
      const name = source.slice(nameStart, index).toUpperCase();
      while (index < source.length && /\s/.test(source[index])) index += 1;
      if (!name || source[index] !== '=') {
        while (index < source.length && source[index] !== ',') index += 1;
        continue;
      }
      index += 1;
      while (index < source.length && /\s/.test(source[index])) index += 1;
      let value = '';
      if (source[index] === '"') {
        index += 1;
        while (index < source.length) {
          if (source[index] === '"') {
            index += 1;
            break;
          }
          value += source[index];
          index += 1;
        }
      } else {
        const valueStart = index;
        while (index < source.length && source[index] !== ',') index += 1;
        value = source.slice(valueStart, index).trim();
      }
      attributes[name] = value;
      while (index < source.length && source[index] !== ',') index += 1;
    }
    return attributes;
  }

  function videoCodecLabel(value) {
    const codec = String(value || '').trim().toLowerCase();
    if (/^(?:av01|av1)/.test(codec)) return 'AV1';
    if (/^(?:vp09|vp9)/.test(codec)) return 'VP9';
    if (/^(?:hev1|hvc1|hevc)/.test(codec)) return 'H.265';
    if (/^(?:avc1|avc3|h264)/.test(codec)) return 'H.264';
    if (/^(?:vp08|vp8)/.test(codec)) return 'VP8';
    return null;
  }

  function audioCodecLabel(value) {
    const codec = String(value || '').trim().toLowerCase();
    if (/^(?:mp4a|aac)/.test(codec)) return 'AAC';
    if (/^opus/.test(codec)) return 'Opus';
    if (/^(?:ac-3|ac3)/.test(codec)) return 'AC-3';
    if (/^(?:ec-3|eac3)/.test(codec)) return 'E-AC-3';
    if (/^vorbis/.test(codec)) return 'Vorbis';
    return null;
  }

  function decodeXmlText(value) {
    return String(value || '')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>');
  }

  function parseXmlAttributes(source) {
    const attributes = {};
    const pattern = /([A-Za-z_:][A-Za-z0-9_.:-]*)\s*=\s*(["'])([\s\S]*?)\2/g;
    let match;
    while ((match = pattern.exec(String(source || '')))) {
      attributes[match[1].toLowerCase()] = decodeXmlText(match[3]);
    }
    return attributes;
  }

  function parseIsoDuration(value) {
    const match = String(value || '').match(/^P(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i);
    if (!match) return null;
    const seconds = (Number(match[1] || 0) * 86400)
      + (Number(match[2] || 0) * 3600)
      + (Number(match[3] || 0) * 60)
      + Number(match[4] || 0);
    return positiveNumber(seconds);
  }

  function dashDrmSystem(manifestText) {
    const descriptor = String(manifestText || '').toLowerCase();
    if (!descriptor.includes('contentprotection')) return null;
    if (descriptor.includes('widevine') || descriptor.includes('edef8ba9-79d6-4ace-a3c8-27dcd51d21ed')) return 'Widevine';
    if (descriptor.includes('playready') || descriptor.includes('9a04f079-9840-4286-ab92-e65be0885f95')) return 'PlayReady';
    if (descriptor.includes('clearkey') || descriptor.includes('e2719d58-a985-b3c9-781a-b030af78d30e')) return 'ClearKey';
    if (descriptor.includes('mp4protection:2011') || descriptor.includes('cenc:default_kid')) return 'CENC';
    return 'DRM';
  }

  function parseDashRepresentations(source, inheritedAttributes = {}) {
    const representations = [];
    const pattern = /<Representation\b([^>]*?)(?:\/\s*>|>([\s\S]*?)<\/Representation\s*>)/gi;
    let match;
    while ((match = pattern.exec(String(source || '')))) {
      const attributes = { ...inheritedAttributes, ...parseXmlAttributes(match[1]) };
      const codecs = String(attributes.codecs || '').split(',').map((codec) => codec.trim()).filter(Boolean);
      const videoCodec = codecs.map(videoCodecLabel).find(Boolean) || null;
      const audioCodec = codecs.map(audioCodecLabel).find(Boolean) || null;
      const mimeType = String(attributes.mimetype || '').toLowerCase();
      const contentType = String(attributes.contenttype || '').toLowerCase();
      const width = positiveNumber(attributes.width);
      const height = positiveNumber(attributes.height);
      const kind = contentType === 'audio' || mimeType.startsWith('audio/') || (!width && !height && audioCodec)
        ? 'audio'
        : (contentType === 'video' || mimeType.startsWith('video/') || width || height || videoCodec ? 'video' : null);
      if (!kind) continue;
      const id = String(attributes.id || '').trim();
      const baseUrlText = match[2]?.match(/<BaseURL(?:\s[^>]*)?>([\s\S]*?)<\/BaseURL\s*>/i)?.[1];
      representations.push({
        id,
        safeFormatId: /^[A-Za-z0-9_.:-]{1,120}$/.test(id) ? id : null,
        kind,
        width,
        height,
        bandwidthBitsPerSecond: positiveNumber(attributes.bandwidth),
        frameRate: positiveNumber(String(attributes.framerate || '').split('/')[0]),
        videoCodec,
        audioCodec,
        mimeType,
        extension: mimeType.includes('webm') ? 'webm' : 'mp4',
        baseUrl: baseUrlText ? decodeXmlText(baseUrlText.trim()) : null,
      });
    }
    return representations;
  }

  function parseDashManifest(manifestText, manifestUrl) {
    const text = String(manifestText || '');
    const mpdMatch = text.match(/<MPD\b([^>]*)>/i);
    if (!mpdMatch) return null;
    const mpdAttributes = parseXmlAttributes(mpdMatch[1]);
    const representations = [];
    const adaptationPattern = /<AdaptationSet\b([^>]*)>([\s\S]*?)<\/AdaptationSet\s*>/gi;
    let adaptationMatch;
    while ((adaptationMatch = adaptationPattern.exec(text))) {
      representations.push(...parseDashRepresentations(
        adaptationMatch[2],
        parseXmlAttributes(adaptationMatch[1]),
      ));
    }
    if (representations.length === 0) representations.push(...parseDashRepresentations(text));
    const uniqueRepresentations = Array.from(new Map(
      representations.map((representation) => [`${representation.kind}:${representation.id}:${representation.height || 0}:${representation.bandwidthBitsPerSecond || 0}`, representation]),
    ).values());
    const videos = uniqueRepresentations.filter((representation) => representation.kind === 'video')
      .sort((left, right) => (right.height || 0) - (left.height || 0)
        || (right.bandwidthBitsPerSecond || 0) - (left.bandwidthBitsPerSecond || 0));
    const audios = uniqueRepresentations.filter((representation) => representation.kind === 'audio')
      .sort((left, right) => (right.bandwidthBitsPerSecond || 0) - (left.bandwidthBitsPerSecond || 0));
    const drmSystem = dashDrmSystem(text);
    return {
      manifestUrl: resolveHttpUrl(manifestUrl),
      durationSeconds: parseIsoDuration(mpdAttributes.mediapresentationduration),
      isLive: String(mpdAttributes.type || '').toLowerCase() === 'dynamic',
      isDrmProtected: Boolean(drmSystem),
      drmSystem,
      videos,
      audios,
    };
  }

  function drmSystemForKey(attributes) {
    const method = String(attributes.METHOD || '').toUpperCase();
    if (!method || method === 'NONE') return null;
    const descriptor = `${attributes.KEYFORMAT || ''} ${attributes.URI || ''}`.toLowerCase();
    if (descriptor.includes('widevine') || descriptor.includes('edef8ba9-79d6-4ace-a3c8-27dcd51d21ed')) return 'Widevine';
    if (descriptor.includes('playready') || descriptor.includes('9a04f079-9840-4286-ab92-e65be0885f95')) return 'PlayReady';
    if (descriptor.includes('com.apple.streamingkeydelivery') || descriptor.includes('skd://')) return 'FairPlay';
    if (method.includes('SAMPLE-AES') || (attributes.KEYFORMAT && String(attributes.KEYFORMAT).toLowerCase() !== 'identity')) return 'DRM';
    return null;
  }

  function parseHlsPlaylist(manifestText, playlistUrl) {
    const text = String(manifestText || '');
    if (!/^\s*#EXTM3U\b/im.test(text)) return null;
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const variants = [];
    let durationSeconds = 0;
    let pendingVariant = null;
    let isEncrypted = false;
    let drmSystem = null;
    for (const line of lines) {
      if (/^#EXT-X-(?:SESSION-)?KEY:/i.test(line)) {
        const attributes = parseAttributeList(line);
        const method = String(attributes.METHOD || '').toUpperCase();
        if (method && method !== 'NONE') isEncrypted = true;
        drmSystem = drmSystem || drmSystemForKey(attributes);
        continue;
      }
      const durationMatch = line.match(/^#EXTINF:\s*([0-9]+(?:\.[0-9]+)?)/i);
      if (durationMatch) {
        durationSeconds += positiveNumber(durationMatch[1]) || 0;
        continue;
      }
      if (/^#EXT-X-STREAM-INF:/i.test(line)) {
        const attributes = parseAttributeList(line);
        const resolution = String(attributes.RESOLUTION || '').match(/^(\d{2,5})x(\d{2,5})$/i);
        const codecs = String(attributes.CODECS || '').split(',').map((codec) => codec.trim()).filter(Boolean);
        pendingVariant = {
          width: positiveNumber(resolution?.[1]),
          height: positiveNumber(resolution?.[2]),
          bandwidthBitsPerSecond: positiveNumber(attributes['AVERAGE-BANDWIDTH']) || positiveNumber(attributes.BANDWIDTH),
          videoCodec: codecs.map(videoCodecLabel).find(Boolean) || null,
          audioCodec: codecs.map(audioCodecLabel).find(Boolean) || null,
          audioGroup: attributes.AUDIO || null,
          frameRate: positiveNumber(attributes['FRAME-RATE']),
        };
        continue;
      }
      if (line.startsWith('#')) continue;
      if (!pendingVariant) continue;
      const url = resolveHttpUrl(line, playlistUrl);
      if (url) variants.push({ ...pendingVariant, url });
      pendingVariant = null;
    }
    const uniqueVariants = Array.from(new Map(variants.map((variant) => [variant.url, variant])).values())
      .sort((left, right) => (right.height || 0) - (left.height || 0)
        || (right.bandwidthBitsPerSecond || 0) - (left.bandwidthBitsPerSecond || 0));
    return {
      variants: uniqueVariants,
      durationSeconds: durationSeconds || null,
      isLive: !lines.some((line) => /^#EXT-X-ENDLIST$/i.test(line)),
      isEncrypted,
      isDrmProtected: Boolean(drmSystem),
      drmSystem,
      isMaster: uniqueVariants.length > 0,
    };
  }

  function estimatedSizeBytes(durationSeconds, bandwidthBitsPerSecond) {
    const duration = positiveNumber(durationSeconds);
    const bandwidth = positiveNumber(bandwidthBitsPerSecond);
    return duration && bandwidth ? Math.round(duration * bandwidth / 8) : null;
  }

  function buildHlsCandidate(candidate, manifest, mediaPlaylist = null) {
    if (!candidate || !manifest) return candidate;
    const durationSeconds = mediaPlaylist?.durationSeconds || manifest.durationSeconds || null;
    const isLive = mediaPlaylist ? mediaPlaylist.isLive : manifest.isLive;
    const drmSystem = manifest.drmSystem || mediaPlaylist?.drmSystem || null;
    const isDrmProtected = manifest.isDrmProtected || mediaPlaylist?.isDrmProtected || false;
    const isEncrypted = manifest.isEncrypted || mediaPlaylist?.isEncrypted || false;
    const variants = manifest.variants.slice(0, 20).map((variant, index) => ({
      ...variant,
      formatId: null,
      extension: 'mp4',
      mime: 'video/mp4',
      qualityLabel: variant.height ? `${variant.height}p` : null,
      resolution: variant.height || null,
      bitrateKbps: variant.bandwidthBitsPerSecond ? Math.round(variant.bandwidthBitsPerSecond / 1000) : null,
      sizeBytes: isLive ? null : estimatedSizeBytes(durationSeconds, variant.bandwidthBitsPerSecond),
      sourceClient: 'hls',
      hasVideo: true,
      hasAudio: Boolean(variant.audioCodec || variant.audioGroup),
      variantIndex: index,
    }));
    const primary = variants[0] || null;
    return {
      ...candidate,
      ...(primary || {}),
      url: candidate.url,
      kind: 'video',
      resourceType: 'hls',
      sourceClient: 'hls',
      extension: 'mp4',
      manifestExtension: 'm3u8',
      mime: 'application/vnd.apple.mpegurl',
      durationSeconds,
      isLive,
      isEncrypted,
      isDrmProtected,
      drmSystem,
      downloadStrategy: isDrmProtected ? 'unsupported' : (isLive ? 'record' : 'merge'),
      isRecommended: !isDrmProtected,
      variants,
      manifestInspected: true,
    };
  }

  function bestDashAudio(video, audios) {
    return audios.find((audio) => audio.extension === video.extension && audio.safeFormatId)
      || audios.find((audio) => audio.safeFormatId)
      || null;
  }

  function buildDashCandidate(candidate, manifest) {
    if (!candidate || !manifest) return candidate;
    const variants = manifest.videos.filter((video) => video.safeFormatId).slice(0, 20).map((video) => {
      const audio = bestDashAudio(video, manifest.audios);
      const formatId = audio ? `${video.safeFormatId}+${audio.safeFormatId}/${video.safeFormatId}` : video.safeFormatId;
      return {
        url: candidate.url,
        formatId,
        extension: video.extension,
        mime: video.mimeType || `video/${video.extension}`,
        qualityLabel: video.height ? `${video.height}p` : null,
        resolution: video.height || null,
        width: video.width,
        height: video.height,
        frameRate: video.frameRate,
        bandwidthBitsPerSecond: video.bandwidthBitsPerSecond,
        bitrateKbps: video.bandwidthBitsPerSecond ? Math.round(video.bandwidthBitsPerSecond / 1000) : null,
        videoCodec: video.videoCodec,
        audioCodec: audio?.audioCodec || null,
        sizeBytes: manifest.isLive ? null : estimatedSizeBytes(manifest.durationSeconds, (video.bandwidthBitsPerSecond || 0) + (audio?.bandwidthBitsPerSecond || 0)),
        sourceClient: 'dash',
        hasVideo: true,
        hasAudio: Boolean(audio),
      };
    });
    const primary = variants[0] || null;
    const bestVideo = manifest.videos[0] || null;
    return {
      ...candidate,
      ...(primary || {
        qualityLabel: bestVideo?.height ? `${bestVideo.height}p` : null,
        resolution: bestVideo?.height || null,
        width: bestVideo?.width || null,
        height: bestVideo?.height || null,
        videoCodec: bestVideo?.videoCodec || null,
      }),
      url: candidate.url,
      kind: 'video',
      resourceType: 'dash',
      sourceClient: 'dash',
      extension: primary?.extension || 'mp4',
      manifestExtension: 'mpd',
      mime: 'application/dash+xml',
      durationSeconds: manifest.durationSeconds,
      isLive: manifest.isLive,
      isDrmProtected: manifest.isDrmProtected,
      drmSystem: manifest.drmSystem,
      downloadStrategy: manifest.isDrmProtected ? 'unsupported' : (manifest.isLive ? 'record' : 'merge'),
      isRecommended: !manifest.isDrmProtected,
      variants,
      manifestInspected: true,
    };
  }

  return Object.freeze({
    buildHlsCandidate,
    buildDashCandidate,
    dashDrmSystem,
    estimatedSizeBytes,
    parseAttributeList,
    parseHlsPlaylist,
    parseDashManifest,
    parseIsoDuration,
    parseXmlAttributes,
    resolveHttpUrl,
    videoCodecLabel,
    audioCodecLabel,
  });
}));
