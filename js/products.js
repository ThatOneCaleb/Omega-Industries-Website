/**
 * Omega Industries Product Catalog
 * All products with part numbers, pricing, specs, and categorization
 */

const CATALOG = {
  categories: [
    {
      id: 'powder-coating',
      name: 'Powder Coating',
      slug: 'powder-coating',
      description: 'Professional powder coating equipment, guns, parts, and accessories. Wagner technology with Fanuc robotic automation.',
      subcategories: [
        { id: 'pc-guns', name: 'Powder Guns' },
        { id: 'pc-nozzles', name: 'Spray Nozzles & Tips' },
        { id: 'pc-hoses', name: 'Hoses & Cables' },
        { id: 'pc-parts', name: 'Replacement Parts' },
        { id: 'pc-booths', name: 'Booth Filters' },
        { id: 'pc-controls', name: 'Controllers & Pumps' },
      ]
    },
    {
      id: 'air-filters',
      name: 'Air Filters',
      slug: 'air-filters',
      description: 'Industrial air filtration for HVAC, dust collection, paint booths, and more. 1000+ SKUs from Donaldson, Koch, and more.',
      subcategories: [
        { id: 'af-hvac', name: 'HVAC Panel Filters' },
        { id: 'af-pleated', name: 'Pleated Filters' },
        { id: 'af-hepa', name: 'HEPA Filters' },
        { id: 'af-cartridge', name: 'Dust Collection Cartridges' },
        { id: 'af-booth', name: 'Paint Booth Filters' },
        { id: 'af-bag', name: 'Bag Filters' },
        { id: 'af-washable', name: 'Washable Metal Filters' },
      ]
    },
    {
      id: 'liquid-finishing',
      name: 'Liquid Finishing',
      slug: 'liquid-finishing',
      description: 'Liquid finishing equipment including spray guns, pumps, hoses, fittings, and accessories. GFS booths and CAT Pumps.',
      subcategories: [
        { id: 'lf-guns', name: 'Spray Guns' },
        { id: 'lf-pumps', name: 'Fluid Pumps' },
        { id: 'lf-pots', name: 'Pressure Pots' },
        { id: 'lf-hoses', name: 'Hoses & Fittings' },
        { id: 'lf-tips', name: 'Tips & Caps' },
        { id: 'lf-accessories', name: 'Accessories & Kits' },
      ]
    }
  ],

  products: [
    // ========================
    // POWDER COATING (10)
    // ========================
    {
      id: 'pc-001',
      partNumber: 'WG-PC-GUN-100',
      name: 'Wagner Manual Powder Gun',
      category: 'powder-coating',
      subcategory: 'pc-guns',
      brand: 'Wagner',
      price: 1295.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Powder+Gun',
      specs: {
        voltage: '100kV max',
        weight: '380g',
        airConsumption: '5.0 Nm³/h',
        chargingMethod: 'Corona'
      },
      description: 'Professional-grade manual electrostatic powder coating gun with advanced corona charging technology. Designed for high transfer efficiency in production and job shop environments.',
      tags: ['popular']
    },
    {
      id: 'pc-002',
      partNumber: 'WG-PC-NZL-200',
      name: 'Wagner Flat Spray Nozzle',
      category: 'powder-coating',
      subcategory: 'pc-nozzles',
      brand: 'Wagner',
      price: 45.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Flat+Nozzle',
      specs: {
        pattern: 'Flat fan',
        material: 'Delrin',
        threadSize: 'M8',
        compatibility: 'PEM-X1, GM Series'
      },
      description: 'Wide flat fan spray nozzle for uniform powder distribution on large flat surfaces. Produces consistent 8-12" spray pattern.',
      tags: []
    },
    {
      id: 'pc-003',
      partNumber: 'WG-PC-NZL-210',
      name: 'Wagner Conical Spray Nozzle',
      category: 'powder-coating',
      subcategory: 'pc-nozzles',
      brand: 'Wagner',
      price: 42.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Conical+Nozzle',
      specs: {
        pattern: 'Conical',
        material: 'Delrin',
        threadSize: 'M8',
        compatibility: 'PEM-X1, GM Series'
      },
      description: 'Conical spray pattern nozzle ideal for recessed areas, Faraday cage zones, and complex geometries. Excellent penetration into corners.',
      tags: []
    },
    {
      id: 'pc-004',
      partNumber: 'WG-PC-HSE-300',
      name: 'Powder Delivery Hose 25ft',
      category: 'powder-coating',
      subcategory: 'pc-hoses',
      brand: 'Wagner',
      price: 189.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Powder+Hose',
      specs: {
        length: '25 ft',
        innerDiameter: '11mm',
        material: 'Anti-static polyurethane',
        maxPressure: '10 bar'
      },
      description: 'Anti-static powder delivery hose with smooth bore interior for minimal powder buildup. Conductive material prevents static charge accumulation.',
      tags: []
    },
    {
      id: 'pc-005',
      partNumber: 'WG-PC-ELP-400',
      name: 'Electrode Pin Assembly (10-Pack)',
      category: 'powder-coating',
      subcategory: 'pc-parts',
      brand: 'Wagner',
      price: 78.50,
      unit: 'PK',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Electrode+Pins',
      specs: {
        quantity: '10 per pack',
        material: 'Tungsten carbide',
        compatibility: 'PEM-X1, GM 5000',
        type: 'Corona charging'
      },
      description: 'Replacement tungsten carbide electrode pins for consistent corona discharge. High wear resistance for extended service life in production environments.',
      tags: ['popular']
    },
    {
      id: 'pc-006',
      partNumber: 'WG-PC-DEF-410',
      name: 'Powder Deflector Star',
      category: 'powder-coating',
      subcategory: 'pc-parts',
      brand: 'Wagner',
      price: 32.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Deflector+Star',
      specs: {
        material: 'Polyethylene',
        outerDiameter: '55mm',
        compatibility: 'GM Series, PEM-X1'
      },
      description: 'Replacement deflector star for powder gun nozzle assembly. Creates optimal cloud pattern for consistent coating thickness.',
      tags: []
    },
    {
      id: 'pc-007',
      partNumber: 'WG-PC-FLT-500',
      name: 'Booth Cartridge Filter 26x36',
      category: 'powder-coating',
      subcategory: 'pc-booths',
      brand: 'Donaldson',
      price: 245.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Booth+Filter',
      specs: {
        size: '26" x 36"',
        media: 'Spunbond polyester',
        efficiency: '99.7% at 0.5μm',
        endCaps: 'Galvanized steel'
      },
      description: 'High-efficiency cartridge filter for powder coating recovery booths. PTFE membrane coating for excellent powder release during pulse cleaning.',
      tags: []
    },
    {
      id: 'pc-008',
      partNumber: 'WG-PC-CBL-310',
      name: 'Gun Control Cable 15ft',
      category: 'powder-coating',
      subcategory: 'pc-hoses',
      brand: 'Wagner',
      price: 156.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Control+Cable',
      specs: {
        length: '15 ft',
        conductors: '12-pin connector',
        shielding: 'EMI shielded',
        compatibility: 'EPA, ITC Series'
      },
      description: 'Shielded control cable connecting powder gun to controller unit. Multi-pin connector for gun voltage, air, and signal control.',
      tags: []
    },
    {
      id: 'pc-009',
      partNumber: 'WG-PC-PMP-600',
      name: 'Wagner Dense Phase Powder Pump',
      category: 'powder-coating',
      subcategory: 'pc-controls',
      brand: 'Wagner',
      price: 2850.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=Powder+Pump',
      specs: {
        type: 'Dense phase',
        outputRate: '600 g/min max',
        airSupply: '6 bar',
        powderTypes: 'Epoxy, polyester, hybrid, TGIC'
      },
      description: 'Advanced dense phase powder pump delivering consistent, gentle powder flow for superior finish quality. Reduces powder waste and overspray.',
      tags: ['new']
    },
    {
      id: 'pc-010',
      partNumber: 'WG-PC-CTL-610',
      name: 'Wagner ITC 2 Controller',
      category: 'powder-coating',
      subcategory: 'pc-controls',
      brand: 'Wagner',
      price: 3495.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/2D8F4E?text=ITC+Controller',
      specs: {
        channels: '2 gun control',
        display: '7" touchscreen',
        presets: '100 recipe storage',
        interface: 'Ethernet/IP, DeviceNet'
      },
      description: 'Intelligent controller for up to 2 automatic powder guns. Touchscreen interface with 100 coating recipe presets and real-time monitoring.',
      tags: ['new']
    },

    // ========================
    // AIR FILTERS (10)
    // ========================
    {
      id: 'af-001',
      partNumber: 'AF-HVAC-2020-2',
      name: '20x20x2 HVAC Panel Filter',
      category: 'air-filters',
      subcategory: 'af-hvac',
      brand: 'Koch',
      price: 8.75,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=HVAC+Panel',
      specs: {
        size: '20x20x2',
        merv: '8',
        media: 'Synthetic pleated',
        frameType: 'Beverage board'
      },
      description: 'Standard efficiency HVAC panel filter for commercial and industrial ventilation systems. MERV 8 rated for general building protection.',
      tags: ['popular']
    },
    {
      id: 'af-002',
      partNumber: 'AF-PLT-2424-4',
      name: '24x24x4 Pleated Air Filter',
      category: 'air-filters',
      subcategory: 'af-pleated',
      brand: 'Koch',
      price: 18.50,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Pleated+Filter',
      specs: {
        size: '24x24x4',
        merv: '11',
        media: 'Electrostatically charged synthetic',
        maxTemp: '180°F'
      },
      description: 'Extended surface area pleated filter with MERV 11 rating. Captures dust, pollen, mold spores, and fine particulate. Ideal for improved indoor air quality.',
      tags: ['popular']
    },
    {
      id: 'af-003',
      partNumber: 'AF-HEPA-2424-12',
      name: '24x24x12 HEPA Panel Filter',
      category: 'air-filters',
      subcategory: 'af-hepa',
      brand: 'Donaldson',
      price: 289.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=HEPA+Filter',
      specs: {
        size: '24x24x12',
        efficiency: '99.97% at 0.3μm',
        media: 'Microfiberglass',
        frameType: 'Aluminum / MDF'
      },
      description: 'True HEPA filter achieving 99.97% efficiency at 0.3 microns. For cleanroom, pharmaceutical, and critical process applications.',
      tags: ['popular']
    },
    {
      id: 'af-004',
      partNumber: 'DN-DC-CRT-1326',
      name: 'Donaldson Dust Cartridge 13x26',
      category: 'air-filters',
      subcategory: 'af-cartridge',
      brand: 'Donaldson',
      price: 165.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Dust+Cartridge',
      specs: {
        size: '13" dia x 26" L',
        media: 'Ultra-Web nanofiber',
        surfaceArea: '200 sq ft',
        maxTemp: '250°F'
      },
      description: 'Premium dust collection cartridge with Ultra-Web nanofiber technology. Surface loading design for superior pulse-clean performance and longer filter life.',
      tags: []
    },
    {
      id: 'af-005',
      partNumber: 'AF-PB-EXH-2024',
      name: 'Paint Booth Exhaust Pad 20x24',
      category: 'air-filters',
      subcategory: 'af-booth',
      brand: 'Koch',
      price: 4.25,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Booth+Pad',
      specs: {
        size: '20x24x2',
        type: 'Fiberglass paint arrestor',
        efficiency: '95% at 10μm',
        maxLoad: '1.5 lbs paint per sq ft'
      },
      description: 'Fiberglass paint arrestor pad for spray booth exhaust filtration. High paint holding capacity with progressive density design.',
      tags: []
    },
    {
      id: 'af-006',
      partNumber: 'AF-PB-INT-2025',
      name: 'Spray Booth Intake Filter 20x25',
      category: 'air-filters',
      subcategory: 'af-booth',
      brand: 'Koch',
      price: 12.50,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Intake+Filter',
      specs: {
        size: '20x25x2',
        merv: '13',
        type: 'Ceiling intake diffusion media',
        velocity: '50 FPM nominal'
      },
      description: 'Ceiling-mounted intake diffusion filter for spray booth air supply. Ensures clean, contaminant-free air reaches the spray zone.',
      tags: []
    },
    {
      id: 'af-007',
      partNumber: 'AF-BAG-6X58',
      name: 'Bag Filter 6" x 58"',
      category: 'air-filters',
      subcategory: 'af-bag',
      brand: 'Donaldson',
      price: 42.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Bag+Filter',
      specs: {
        size: '6" dia x 58" L',
        media: 'Polyester felt',
        weight: '16 oz/yd²',
        finish: 'Singed and glazed'
      },
      description: 'Industrial pulse-jet bag filter for dust collection systems. Singed and glazed surface for excellent cake release and cleaning efficiency.',
      tags: []
    },
    {
      id: 'af-008',
      partNumber: 'AF-WSH-2020',
      name: 'Aluminum Washable Filter 20x20x2',
      category: 'air-filters',
      subcategory: 'af-washable',
      brand: 'Koch',
      price: 38.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Washable+Metal',
      specs: {
        size: '20x20x2',
        material: 'Aluminum mesh',
        merv: '4',
        washable: 'Yes — indefinite reuse'
      },
      description: 'Permanent aluminum mesh filter that can be washed and reused indefinitely. Ideal for pre-filtration in high-contamination environments.',
      tags: []
    },
    {
      id: 'af-009',
      partNumber: 'AF-PLT-1620-1',
      name: '16x20x1 Pleated Filter (Case of 12)',
      category: 'air-filters',
      subcategory: 'af-pleated',
      brand: 'Koch',
      price: 68.00,
      unit: 'CS',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Filter+Case',
      specs: {
        size: '16x20x1',
        merv: '8',
        quantity: '12 per case',
        media: 'Synthetic pleated'
      },
      description: 'Case pack of 12 standard pleated filters for HVAC replacement. MERV 8 rated for commercial and residential use.',
      tags: ['sale']
    },
    {
      id: 'af-010',
      partNumber: 'AF-CRB-2424-2',
      name: '24x24x2 Carbon Panel Filter',
      category: 'air-filters',
      subcategory: 'af-hvac',
      brand: 'Donaldson',
      price: 34.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/1A6FC4?text=Carbon+Filter',
      specs: {
        size: '24x24x2',
        media: 'Activated carbon impregnated',
        adsorption: 'VOCs, odors, light gases',
        merv: '7'
      },
      description: 'Activated carbon panel filter for odor and VOC removal in ventilation systems. Dual-function: particulate and gas-phase filtration.',
      tags: ['new']
    },

    // ========================
    // LIQUID FINISHING (10)
    // ========================
    {
      id: 'lf-001',
      partNumber: 'GFS-LF-GUN-700',
      name: 'HVLP Gravity Feed Spray Gun',
      category: 'liquid-finishing',
      subcategory: 'lf-guns',
      brand: 'GFS',
      price: 385.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=HVLP+Gun',
      specs: {
        type: 'HVLP gravity feed',
        nozzleSize: '1.3mm',
        cupCapacity: '600ml',
        airConsumption: '9.5 CFM @ 29 PSI'
      },
      description: 'High Volume Low Pressure spray gun with gravity feed cup. Achieves 65%+ transfer efficiency for reduced material waste and VOC emissions.',
      tags: ['popular']
    },
    {
      id: 'lf-002',
      partNumber: 'GFS-LF-GUN-710',
      name: 'Pressure Feed Spray Gun',
      category: 'liquid-finishing',
      subcategory: 'lf-guns',
      brand: 'GFS',
      price: 425.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Pressure+Gun',
      specs: {
        type: 'Conventional pressure feed',
        nozzleSize: '1.4mm',
        fluidDelivery: '18 oz/min max',
        airConsumption: '12 CFM @ 50 PSI'
      },
      description: 'Pressure feed spray gun for high-volume production applications. Optimized for viscous materials including primers, sealers, and high-solids coatings.',
      tags: []
    },
    {
      id: 'lf-003',
      partNumber: 'CAT-LF-PMP-800',
      name: 'CAT Pumps Diaphragm Pump 2:1',
      category: 'liquid-finishing',
      subcategory: 'lf-pumps',
      brand: 'CAT Pumps',
      price: 1150.00,
      unit: 'EA',
      inStock: true,
      quickShip: false,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Diaphragm+Pump',
      specs: {
        ratio: '2:1',
        maxFluidPressure: '100 PSI',
        maxFlowRate: '4 GPM',
        fluidContact: 'PTFE / Stainless Steel'
      },
      description: '2:1 air-operated double diaphragm pump for fluid delivery to spray equipment. Suitable for paints, stains, lacquers, and adhesives.',
      tags: []
    },
    {
      id: 'lf-004',
      partNumber: 'GFS-LF-POT-820',
      name: '2 Gallon Pressure Pot',
      category: 'liquid-finishing',
      subcategory: 'lf-pots',
      brand: 'GFS',
      price: 525.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Pressure+Pot',
      specs: {
        capacity: '2 gallon',
        maxPressure: '80 PSI',
        material: 'Carbon steel / zinc plated',
        agitator: 'Included'
      },
      description: 'ASME coded pressure pot with mechanical agitator for consistent material delivery. Suitable for solvent-based and waterborne coatings.',
      tags: ['popular']
    },
    {
      id: 'lf-005',
      partNumber: 'GFS-LF-HSE-900',
      name: 'Fluid Hose Assembly 3/8" x 25ft',
      category: 'liquid-finishing',
      subcategory: 'lf-hoses',
      brand: 'GFS',
      price: 89.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Fluid+Hose',
      specs: {
        innerDiameter: '3/8"',
        length: '25 ft',
        maxPressure: '250 PSI',
        fittings: '1/4" NPS both ends'
      },
      description: 'High-pressure fluid hose assembly for paint delivery from pump to gun. Chemical resistant inner tube compatible with solvent and waterborne materials.',
      tags: []
    },
    {
      id: 'lf-006',
      partNumber: 'GFS-LF-HSE-910',
      name: 'Air Hose Assembly 3/8" x 50ft',
      category: 'liquid-finishing',
      subcategory: 'lf-hoses',
      brand: 'GFS',
      price: 62.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Air+Hose',
      specs: {
        innerDiameter: '3/8"',
        length: '50 ft',
        maxPressure: '300 PSI',
        fittings: 'Industrial quick-connect'
      },
      description: 'Industrial air hose for spray gun and equipment air supply. Lightweight with excellent flexibility for spray booth applications.',
      tags: []
    },
    {
      id: 'lf-007',
      partNumber: 'GFS-LF-REG-920',
      name: 'Air Regulator with Gauge',
      category: 'liquid-finishing',
      subcategory: 'lf-accessories',
      brand: 'GFS',
      price: 48.00,
      unit: 'EA',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Air+Regulator',
      specs: {
        inletSize: '1/4" NPT',
        range: '0-160 PSI',
        gaugeSize: '2" dial',
        body: 'Zinc die cast'
      },
      description: 'Inline air pressure regulator with gauge for precise spray gun pressure control. Essential for consistent atomization and finish quality.',
      tags: []
    },
    {
      id: 'lf-008',
      partNumber: 'GFS-LF-TIP-930',
      name: 'HVLP Needle/Nozzle Kit 1.3mm',
      category: 'liquid-finishing',
      subcategory: 'lf-tips',
      brand: 'GFS',
      price: 65.00,
      unit: 'SET',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Nozzle+Kit',
      specs: {
        nozzleSize: '1.3mm',
        includes: 'Needle, nozzle, air cap',
        material: 'Stainless steel needle / brass nozzle',
        compatibility: 'GFS HVLP Series'
      },
      description: 'Complete needle, nozzle, and air cap set for GFS HVLP spray guns. 1.3mm tip for basecoats, clearcoats, and medium-viscosity materials.',
      tags: []
    },
    {
      id: 'lf-009',
      partNumber: 'GFS-LF-KIT-940',
      name: 'Spray Gun Rebuild Kit',
      category: 'liquid-finishing',
      subcategory: 'lf-accessories',
      brand: 'GFS',
      price: 42.00,
      unit: 'KIT',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Rebuild+Kit',
      specs: {
        includes: 'Seals, springs, packing, o-rings',
        packetsPerKit: '1 complete rebuild',
        compatibility: 'GFS HVLP & Pressure Feed'
      },
      description: 'Complete rebuild kit to restore spray gun to factory performance. Includes all wear items: packings, o-rings, springs, and needle seals.',
      tags: ['sale']
    },
    {
      id: 'lf-010',
      partNumber: 'GFS-LF-FLT-950',
      name: 'Inline Paint Filter (Box of 100)',
      category: 'liquid-finishing',
      subcategory: 'lf-accessories',
      brand: 'GFS',
      price: 54.00,
      unit: 'BX',
      inStock: true,
      quickShip: true,
      image: 'https://placehold.co/600x600/1a1a2e/C94A1A?text=Inline+Filters',
      specs: {
        mesh: '190 micron (fine)',
        type: 'Cone-shaped nylon mesh',
        quantity: '100 per box',
        compatibility: 'Universal'
      },
      description: 'Disposable cone-shaped inline paint filters to remove debris and contaminants before material reaches the spray gun. Prevents finish defects.',
      tags: ['popular']
    }
  ]
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CATALOG;
}
