const FX_API_URL = "https://api.frankfurter.app/latest?from=EUR&to=HUF";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const FALLBACK_RATE = 400;

let cachedRate = null;
let cachedAt = 0;

const readEnvFallbackRate = () => {
  const envRate = parseFloat(process.env.EUR_TO_HUF_RATE);
  return Number.isFinite(envRate) && envRate > 0 ? envRate : FALLBACK_RATE;
};

const getEurToHufRate = async () => {
  const now = Date.now();
  if (cachedRate !== null && now - cachedAt < CACHE_TTL_MS) {
    return cachedRate;
  }

  try {
    const response = await fetch(FX_API_URL);
    if (!response.ok) {
      throw new Error(`Frankfurter API responded with ${response.status}`);
    }
    const data = await response.json();
    const rate = data?.rates?.HUF;
    if (typeof rate !== "number" || rate <= 0) {
      throw new Error("Invalid HUF rate in Frankfurter response");
    }
    cachedRate = rate;
    cachedAt = now;
    return rate;
  } catch (error) {
    console.warn(
      "Failed to fetch live EUR/HUF rate, using fallback:",
      error.message
    );
    return readEnvFallbackRate();
  }
};

module.exports = { getEurToHufRate };
