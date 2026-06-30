/**
 * images.js — Verified unique image URLs, smart location matching, fallbacks.
 * Every key maps to a distinct Unsplash photo (no duplicates).
 */
const NxgoImages = (function () {
  'use strict';

  const BASE = 'https://images.unsplash.com';

  const photos = {
    /* Taiwan landmarks */
    jiufen:      'photo-1528164344705-47542687000d',
    taipei101:   'photo-1474181487882-5abf3f0ba6c2',
    ximending:   'photo-1559339352-11d035aa65de',
    cats:        'photo-1514888286974-6c03e2ca1dba',
    cablecar:    'photo-1506905925346-21bda4d32df4',
    temple:      'photo-1548013146-72479768bada',
    rainbow:     'photo-1596422846543-75c6fc197f07',
    taipei:      'photo-1540959733332-eab4deabeeaf',
    taichung:    'photo-1502920917128-1aa500764cbd',
    station:     'photo-1503899036084-c55cdd92da26',
    alishan:     'photo-1470071459604-3b5ec3a7fe05',
    pingxi:      'photo-1615880484746-a134be9a6ecf',
    tainan:      'photo-1555396273-367ea4eb4db5',
    taroko:      'photo-1432405972618-c60b0225b8f9',
    lanterns:    'photo-1605649487212-47bdab064df7',

    /* Nature & adventure */
    planting:    'photo-1542601906990-b4d3fb778b09',
    cycling:     'photo-1541625602330-2277a4c46182',
    sunmoonlake: 'photo-1476514525535-07fb3b4ae5f1',
    hiking:      'photo-1464822759023-fed622ff2c3b',
    yushan:      'photo-1469474968028-56623f02e42e',
    forest:      'photo-1441974231531-c6227db76b6e',
    waterfall:   'photo-1523906834658-6e24ef2386f9',
    meadow:      'photo-1504280390367-361c6d9f38f4',
    paraglide:   'photo-1520250497591-112f2f40a3f4',
    field:       'photo-1500530855697-b586d89ba3ee',

    /* Coast & water */
    beach:       'photo-1507525428034-b723cf961d3e',
    kenting:     'photo-1518837695005-2083093ee35b',
    coast:       'photo-1559827260-dc66d52bef19',
    surf:        'photo-1571896349842-33c89424de2d',
    snorkel:     'photo-1590523277543-a94d2e4eb00b',
    boating:     'photo-1544551763-46a013bb70d5',
    harbor:      'photo-1469854523086-cc02fe5d8800',

    /* Food */
    food:        'photo-1604908176997-125f25cc6f3d',
    taro:        'photo-1563245372-f21724e3856d',
    nightmarket: 'photo-1555939594-58d7cb561ad1',
    market:      'photo-1504674900247-0877df9cc836',
    dumplings:   'photo-1565299624946-b28f40a0ae38',
    brunch:      'photo-1551218808-94e220e084d2',
    dessert:     'photo-1551024506-0bccd828d307',
    noodles:     'photo-1567620905732-2d1ec7ab7445',
    teahouse:    'photo-1414235077428-338989a2e8c0',
    streetfood:  'photo-1540189549336-e6e99c3679fe',

    /* Urban & culture */
    hotspring:   'photo-1544161515-4ab6ce6db874',
    skyline:     'photo-1517248135467-4c7edcad34c4',
    nightcity:   'photo-1548919973-5cef591cdbc9',
    scooter:     'photo-1558981285-6f0c94958bb6',
    train:       'photo-1571019613454-1cb2f99b2d8b',
    shrine:      'photo-1512621776951-a57141f2eefd',
    pottery:     'photo-1501594907352-04cda38ebc29',

    /* People & lifestyle */
    friends:     'photo-1529156069898-49953e39b3ac',
    profile:     'photo-1493225457124-a3eb161ffa5f',
    camera:      'photo-1452587925148-ce544e77e70d',
    backpacker:  'photo-1552733407-5d5c46c3bb3b',
    travelmap:   'photo-1488646953014-85cb44e25828',
    portrait:    'photo-1543269664-7eef42226a21'
  };

  function url(keyOrId, width) {
    const w = width || 600;
    const id = photos[keyOrId] || keyOrId;
    return `${BASE}/${id}?auto=format&fit=crop&w=${w}&q=75`;
  }

  const FALLBACK = url('jiufen', 600);

  /** Pick the best image key from activity name, location, category & interests */
  function matchForPackage(pkg) {
    const text = [
      pkg.prog_name,
      pkg.location,
      pkg.category,
      pkg.events,
      ...(pkg.interests || [])
    ].join(' ').toLowerCase();

    if (/jiufen|old street/.test(text) && !/pingxi|sky lantern/.test(text)) return url('jiufen', 800);
    if (/pingxi|sky lantern/.test(text)) return url('pingxi', 800);
    if (/ximending/.test(text)) return url('ximending', 800);
    if (/sun moon|sunmoon/.test(text)) return url('sunmoonlake', 800);
    if (/yushan/.test(text)) return url('yushan', 800);
    if (/kenting/.test(text)) return url('kenting', 800);
    if (/taichung|rainbow village/.test(text)) return url('rainbow', 800);
    if (/taipei 101|rooftop|xinyi|skyline/.test(text)) return url('taipei101', 800);
    if (/taipei/.test(text)) return url('taipei', 800);
    if (/houtong|cat village/.test(text)) return url('cats', 800);
    if (/alishan|forest railway|sunrise/.test(text)) return url('alishan', 800);
    if (/taroko|gorge|river tracing/.test(text)) return url('taroko', 800);
    if (/tainan|ancient capital|coffin bread/.test(text)) return url('tainan', 800);
    if (/green island|snorkel|taitung/.test(text)) return url('snorkel', 800);
    if (/surf|wai'ao/.test(text)) return url('surf', 800);
    if (/yilan/.test(text)) return url('hotspring', 800);
    if (/monster|culture village/.test(text)) return url('temple', 800);
    if (/plant|tree|eco crew/.test(text)) return url('planting', 800);
    if (/cycl|ride budd|bike/.test(text)) return url('cycling', 800);
    if (/hike|mountain|trail/.test(text)) return url('hiking', 800);
    if (/ocean|beach cleanup|marine/.test(text)) return url('beach', 800);
    if (/night market|foodie|market tour/.test(text)) return url('nightmarket', 800);
    if (/hot spring|jiaoxi/.test(text)) return url('hotspring', 800);
    if (/lantern walk/.test(text)) return url('lanterns', 800);

    const catMap = {
      Eco: 'planting',
      Adventure: 'hiking',
      Food: 'streetfood',
      Culture: 'lanterns'
    };
    return url(catMap[pkg.category] || 'jiufen', 800);
  }

  function getPackageImage(pkg, width) {
    const w = width || 800;
    if (pkg.image && pkg.image_custom) {
      if (pkg.image.startsWith('data:')) return pkg.image;
      return pkg.image.replace(/w=\d+/, `w=${w}`);
    }
    return matchForPackage(pkg).replace(/w=\d+/, `w=${w}`);
  }

  function setupFallbacks(root) {
    const scope = root || document;
    scope.querySelectorAll('img:not([data-fb])').forEach(img => {
      img.dataset.fb = '1';
      img.decoding = 'async';
      if (!img.loading) img.loading = 'lazy';
      img.addEventListener('error', function handler() {
        if (this.src !== FALLBACK) this.src = FALLBACK;
        this.removeEventListener('error', handler);
      });
    });
  }

  return { url, photos, FALLBACK, matchForPackage, getPackageImage, setupFallbacks };
})();
