$(function () {
  var owl = $('.owl-carousel');
  owl.owlCarousel({
    margin: 0,
    stagePadding: 0,
    // center: true,
    items: 1,
    // items: 2,
    // loop: true,
    autoplay: false,
    margin: 50,
    nav: false,
    dots: false,
    // animateOut: 'slideInLeft',
    // animateIn: 'slideOutRight',
    // autoplayHoverPause: true,
    // responsive: {
    //   0: {
    //     items: 1,
    //   },
    //   600: {
    //     items: 1,
    //     // items: 2,
    //   },
    //   1000: {
    //     items: 1,
    //     // items: 2,
    //   },
    // },
  });
});

let busPosition = 0;
let isBusMoving = false;
let targetLocation;
let page;
let bus, paths, speed;
let busWidth = 51.69;
let busHeight = 25;
let isGoingToCanada = false;
let isComingFromCanada = false;
let savedTargetLocation;

setTimeout(function () {
  let container = $('.container')[0];
  const containerWidth = container.clientWidth;
  const zoom = containerWidth / 1002.0;
  const map = document.querySelector('#map_inner > svg');
  map.style.zoom = zoom;

  paths = $('#map_inner > svg > path[stroke="#2b6081"]');
  let totalLength = 0;
  for (let i = 0; i < paths.length; i++) {
    totalLength += paths[i].getTotalLength();
  }
  speed = totalLength / 120;

  const pathname = window.location.pathname;
  const lastPath = pathname.substring(pathname.lastIndexOf('/') + 1);
  
  if (lastPath === 'k12-events.html') {
    page = 'k12';
    $('.sm_location_98').css('display', 'block');
    $('.sm_location_99').css('display', 'none');
    busWidth = 40;
    busHeight = 21;
    bus = $('image.sm_location_98')[0];
  }
  if (lastPath === 'he-events.html' || lastPath === 'he-events-na.html') {
    page = 'he';
    $('.sm_location_98').css('display', 'none');
    $('.sm_location_99').css('display', 'block');
    busWidth = 40;
    busHeight = 21;
    if (lastPath === 'he-events-na.html') {
      busWidth = -16;
      busHeight = -50;
    }
    bus = $('image.sm_location_99')[0];
  }

  $(document).on('click', 'circle', function (e) {
    if (isBusMoving) return;
    const point = e.target;
    const className = point.getAttribute('class');
    targetLocation = parseInt(className.split('_')[2]);
  });
  
  $(document).on('click', 'div.tt_name_sm, div.tt_custom_sm > h3', function (e) {
    if (isBusMoving) return;
    document.getElementById('tt_sm_map').style.display = 'none';
    moveBus();
  });
}, 500);

const moveBus = function () {
  isBusMoving = true;

  if (page === 'he') {
    if (targetLocation === paths.length) {
      isGoingToCanada = true;
      targetLocation = 4;
    }
    // This means bus starts from Canada
    else if (busPosition === paths.length) {
      isComingFromCanada = true;
      bus.setAttribute('href', 'https://i.ibb.co/HgHh67q/winnebago-flat-xs-2x.png');
      goToNewYork();
      return;
    }
  }
  
  if (targetLocation > busPosition) {
    if (page === 'k12') {
      bus.setAttribute('href', 'https://i.ibb.co/DK8KfBc/schoolbus-flat-xs-2x.png');
    } else {
      bus.setAttribute('href', 'https://i.ibb.co/HgHh67q/winnebago-flat-xs-2x.png');
    }
    moveBusForward(bus, busWidth, busHeight, paths, busPosition, targetLocation, 0, speed);
  } else {
    if (page === 'k12') {
      bus.setAttribute('href', 'https://i.ibb.co/MZt7XPC/schoolbus-flat-xs-left-2x.png');
    } else {
      bus.setAttribute('href', 'https://i.ibb.co/d41ZkxQ/winnebago-flat-xs-left-2x.png');
    }

    moveBusBack(
      bus,
      busWidth,
      busHeight,
      paths,
      busPosition - 1,
      targetLocation,
      paths[busPosition - 1].getTotalLength(),
      speed,
    );
  }
};

const moveBusForward = function (
  bus,
  busWidth,
  busHeight,
  paths,
  pathIndex,
  targetIndex,
  dist,
  speed,
) {
  let path = paths[pathIndex];
  var pathLen = path.getTotalLength();
  if (dist > pathLen) {
    // This means bus reached to NY from Canada
    if (pathIndex === paths.length - 1) {
      isComingFromCanada = false;
      targetLocation = savedTargetLocation;
      busPosition = 4;
      moveBus();
      return;
    } else {
      pathIndex++;
      dist = 0;
      if (pathIndex === paths.length - 1) {
        path = null;
      } else {
        path = paths[pathIndex];
      }
    }
  }
  if (path) {
    const pt = path.getPointAtLength(dist);
    bus.setAttribute('x', pt.x - busWidth);
    bus.setAttribute('y', pt.y - busHeight);

    if (pathIndex < targetIndex) {
      setTimeout(function () {
        moveBusForward(
          bus,
          busWidth,
          busHeight,
          paths,
          pathIndex,
          targetIndex,
          dist + speed,
          speed,
        );
      }, 100);
    } else if (pathIndex === paths.length - 1 && isComingFromCanada) {
      setTimeout(function () {
        moveBusForward(
          bus,
          busWidth,
          busHeight,
          paths,
          pathIndex,
          targetIndex,
          dist + speed,
          speed,
        );
      }, 100);
    } else {
      busPosition = targetIndex;
      isBusMoving = false;
      if (isGoingToCanada) {
        goToCanada();
      }
    }
  } else {
    busPosition = targetIndex;
    isBusMoving = false;
    if (isGoingToCanada) {
      goToCanada();
    }
  }
};

const moveBusBack = function (
  bus,
  busWidth,
  busHeight,
  paths,
  pathIndex,
  targetIndex,
  dist,
  speed,
) {
  let path = paths[pathIndex];
  if (dist <= 0) {
    // Need to change path
    
    // If bus is on the road from New York to Canada
    if (pathIndex === paths.length - 1)  {
      // This means bus reached to Canada
      isGoingToCanada = false;
      busPosition = paths.length;
      return;
    }
    
    else {
      pathIndex--;
      if (pathIndex < 0) {
        busPosition = 0;
        isBusMoving = false;
        return;
      }
      path = paths[pathIndex];
      dist = path.getTotalLength();
    }
  }
  if (path) {
    const pt = path.getPointAtLength(dist);
    bus.setAttribute('x', pt.x - busWidth);
    bus.setAttribute('y', pt.y - busHeight);

    if (pathIndex >= targetIndex) {
      setTimeout(function () {
        moveBusBack(bus, busWidth, busHeight, paths, pathIndex, targetIndex, dist - speed, speed);
      }, 100);
    } else if (pathIndex === paths.length -1 && isGoingToCanada) {
      setTimeout(function () {
        moveBusBack(bus, busWidth, busHeight, paths, pathIndex, targetIndex, dist - speed, speed);
      }, 100);
    }
    else {
      busPosition = targetIndex;
      isBusMoving = false;
      if (isGoingToCanada) {
        goToCanada();
      }
    }
  } else {
    busPosition = targetIndex;
    isBusMoving = false;
    if (isGoingToCanada) {
      goToCanada();
    }
  }
};

const goToCanada = function() {
  targetLocation = paths.length;
  let dist = paths[paths.length - 1].getTotalLength();
  bus.setAttribute('href', 'https://i.ibb.co/d41ZkxQ/winnebago-flat-xs-left-2x.png');
  moveBusBack(bus, busWidth, busHeight, paths, paths.length - 1, targetLocation, dist, speed);
}

const goToNewYork = function () {
  savedTargetLocation = targetLocation;
  targetLocation = 4;
  moveBusForward(bus, busWidth, busHeight, paths, paths.length - 1, targetLocation, 0, speed);
}