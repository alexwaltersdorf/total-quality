const baseUrl = (process.env.BASE_URL || "https://totalquality.med.br").replace(/\/$/, "");
const containerId = "GTM-WLR7JD57";
const measurementId = "G-FZH25GKTJ9";
const retiredTransportHost = "server-side-tagging-ie4lymzpwa-uc.a.run.app";

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: { "user-agent": "TotalQuality-Measurement-Health/1.0" },
  });
  return { response, body: await response.text() };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const home = await get("/");
  assert(home.response.ok, `home respondeu ${home.response.status}`);
  assert(
    home.body.includes("/metrics/?id=") && home.body.includes(containerId),
    "o HTML nao carrega o GTM pelo gateway first-party"
  );

  const health = await get("/metrics/healthy");
  assert(health.response.ok, `gateway respondeu ${health.response.status}`);
  assert(health.body.trim() === "ok", "gateway nao respondeu ok");

  const container = await get(`/metrics/?id=${containerId}`);
  assert(container.response.ok, `container GTM respondeu ${container.response.status}`);
  const normalizedContainer = container.body.replaceAll("\\/", "/");
  assert(normalizedContainer.includes(measurementId), `container nao contem ${measurementId}`);
  assert(
    normalizedContainer.includes("transport_url") &&
      normalizedContainer.includes(`${baseUrl}/metrics`),
    "transport_url do GA4 nao aponta para o gateway first-party"
  );
  assert(
    !normalizedContainer.includes(retiredTransportHost),
    "container ainda aponta para o endpoint Cloud Run indisponivel"
  );

  // ID deliberadamente invalido: valida o caminho de coleta sem registrar um
  // evento em qualquer propriedade real e sem enviar identificador de usuario.
  const probe = await get(
    `/metrics/g/collect?v=2&tid=G-HEALTH0000&cid=healthcheck&en=measurement_health_probe&_p=${Date.now()}`
  );
  assert(probe.response.status === 204, `coleta respondeu ${probe.response.status}`);

  console.log("measurement_health=ok loader=ok gateway=ok container=ok collect=ok");
}

main().catch(error => {
  console.error(`measurement_health=failed reason=${error.message}`);
  process.exitCode = 1;
});
