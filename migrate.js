/**
 * migrate.js — Patch broken image URLs + sync location-matched photos + merge new packages.
 */
(function () {
  'use strict';

  const VERSION = 5;
  if (localStorage.getItem('nxgo_migrate_v') === String(VERSION)) return;

  const replacements = {
    'photo-1590736962455-21bb90dfe5e7': 'photo-1559339352-11d035aa65de',
    'photo-1569163139394-de44cb5fddff': 'photo-1548013146-72479768bada',
    'photo-1496116218417-7956956fbbb8': 'photo-1604908176997-125f25cc6f3d',
    'photo-1578662996442-48f60103fc73': 'photo-1596422846543-75c6fc197f07',
    'photo-1558618666-fcd25c85f82e': 'photo-1540959733332-eab4deabeeaf',
    'photo-1474487548417-0fbfb74b0e6d': 'photo-1541625602330-2277a4c46182',
    'photo-1589656966895-2f33e7652839': 'photo-1544551763-46a013bb70d5',
    'photo-1545454675-3531b543be6d': 'photo-1542601906990-b4d3fb778b09',
    'photo-1555992336-fb0d22c71517': 'photo-1528164344705-47542687000d',
    'photo-1466692476869-aef1dfb1e735': 'photo-1542601906990-b4d3fb778b09',
    'photo-1551632811-561732d1e58e': 'photo-1432405972618-c60b0225b8f9',
    'photo-1532996122724-e3c354a0b150': 'photo-1507525428034-b723cf961d3e'
  };

  function fixUrl(url) {
    if (!url) return url;
    let fixed = url;
    Object.keys(replacements).forEach(broken => {
      if (fixed.includes(broken)) fixed = fixed.replace(broken, replacements[broken]);
    });
    return fixed;
  }

  let pkgs = JSON.parse(localStorage.getItem('nxgo_travel_packages') || '[]');

  if (typeof NXGO_EXTRA_PACKAGES !== 'undefined' && pkgs.length) {
    const ids = new Set(pkgs.map(p => p.prog_id));
    NXGO_EXTRA_PACKAGES.forEach(p => {
      if (!ids.has(p.prog_id)) {
        const pkg = { ...p };
        if (typeof NxgoImages !== 'undefined') pkg.image = NxgoImages.matchForPackage(pkg);
        pkgs.push(pkg);
      }
    });
    const counters = JSON.parse(localStorage.getItem('nxgo_counters') || '{}');
    if (!counters.prog_id || counters.prog_id < 15) {
      counters.prog_id = 15;
      localStorage.setItem('nxgo_counters', JSON.stringify(counters));
    }
  }

  if (pkgs.length) {
    pkgs.forEach(p => {
      if (p.image_custom) return;
      p.image = fixUrl(p.image);
      if (typeof NxgoImages !== 'undefined') {
        p.image = NxgoImages.matchForPackage(p);
      }
    });
    localStorage.setItem('nxgo_travel_packages', JSON.stringify(pkgs));
  }

  localStorage.setItem('nxgo_migrate_v', String(VERSION));
})();
