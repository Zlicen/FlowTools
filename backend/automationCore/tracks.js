async function getTrackCount(timeline, trackType) {
  const count = Number(await timeline.GetTrackCount(trackType));
  return Number.isFinite(count) ? count : 0;
}

async function getTrackName(timeline, trackType, trackIndex) {
  const name = await timeline.GetTrackName(trackType, trackIndex);
  return String(name || "");
}

async function findTrackIndexByName(timeline, trackType, trackName) {
  const cleanName = String(trackName || "").trim();

  if (!cleanName) {
    return null;
  }

  const trackCount = await getTrackCount(timeline, trackType);

  for (let index = 1; index <= trackCount; index += 1) {
    const name = await getTrackName(timeline, trackType, index);

    if (name === cleanName) {
      return index;
    }
  }

  return null;
}

module.exports = {
  getTrackCount,
  getTrackName,
  findTrackIndexByName,
};