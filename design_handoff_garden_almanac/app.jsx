// App — assemble the pages onto the Design Canvas.

const { DesignCanvas, DCSection, DCArtboard } = window;

function App() {
  const W = 880, H = 1120;        // portrait
  const WL = 1280, HL = 980;     // landscape (compatibility matrix)
  return (
    <DesignCanvas>
      <DCSection
        id="atlas-pages"
        title="Garden's Almanac of Matter Models — 2026 Edition"
        subtitle="Pages from the Atlas. Off-white paper, charcoal ink, oxblood accent. The Compatibility Matrix is laid out landscape, like a centerfold pull-out reference."
      >
        <DCArtboard id="frontispiece" label="i · Frontispiece" width={W} height={H}>
          <Frontispiece/>
        </DCArtboard>
        <DCArtboard id="about" label="01 · About this Almanac" width={W} height={H}>
          <AboutPage/>
        </DCArtboard>
        <DCArtboard id="atlas" label="02 · The Map" width={W} height={H}>
          <MapPage/>
        </DCArtboard>
        <DCArtboard id="catalog-index" label="02 · Catalog Index (facing)" width={W} height={H}>
          <CatalogIndexPage/>
        </DCArtboard>
        <DCArtboard id="model" label="iii · Model — UMA Medium" width={W} height={H}>
          <ModelPage/>
        </DCArtboard>
        <DCArtboard id="cultivation" label="iv · Cluster — Della" width={W} height={H}>
          <ClusterPage/>
        </DCArtboard>
        <DCArtboard id="cluster-supported" label="iv · Della Supported (facing)" width={W} height={H}>
          <ClusterSupportedPage/>
        </DCArtboard>
        <DCArtboard id="datasets-index" label="05 · Datasets — Index" width={W} height={H}>
          <DatasetsIndexPage/>
        </DCArtboard>
        <DCArtboard id="dataset-omat24" label="05 · Dataset — OMat24" width={W} height={H}>
          <DatasetDetailPage slug="omat24"/>
        </DCArtboard>
        <DCArtboard id="architectures" label="06 · Architectures" width={W} height={H}>
          <ArchitecturesPage side="left"/>
        </DCArtboard>
        <DCArtboard id="architectures-ii" label="06 · Architectures (facing)" width={W} height={H}>
          <ArchitecturesPage side="right"/>
        </DCArtboard>
        <DCArtboard id="compatibility" label="v · The Compatibility Matrix" width={WL} height={HL}>
          <CompatibilityMatrix/>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
