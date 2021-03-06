'use strict';

const electron = require('electron');
const EventEmitter = require('events');
const util = require('util');
const system = require('../vendor/node-system-idle-time/addon');

/**
 * Watches for idle time and emits 'suspend' and 'resume' events accordingly.
 * Uses system idle time and falls back to cursor movement.
 *
 * @param idle_time    - time with no system activity that is considered 'idle'.
 *                       -1 means only system sleep is considered idle
 * @param poll_time_ms - time to poll for cursor position and system time.
 *                       Default: 10% of idle_time
 */
function IdleDetector(idle_time, poll_time_ms) {
  EventEmitter.call(this);

  this.idleTime = idle_time;
  poll_time_ms = (poll_time_ms > idle_time) ? idle_time : poll_time_ms;
  this.pollTime = poll_time_ms || (idle_time * 0.1);
  this.running = false;

  this.lastActive = new Date();
  this.cursorPos = false;
  this.didResume = false;

  var self = this;
  var powerMonitor = electron.powerMonitor;
  powerMonitor.on('suspend', () => {
    console.log('The system is going to sleep. Good night');
    suspend(self);
  });
  powerMonitor.on('resume', () => {
    console.log('The system is waking up. Good morning');
    resume(self);
  }); 

  this.start();
}
util.inherits(IdleDetector, EventEmitter);

/** Ensures 'resume' is only emitted once. */
function resume(self, date) {
  date = date || new Date();
  if (self.running) return;
  self.emit('resume', date);
  self.running = true;
}

/** Ensures 'suspend' is only emitted once. */
function suspend(self, date) {
  date = date || new Date();
  if (!self.running) return;
  self.emit('suspend', date);
  self.running = false;
}

/** Starts the tick interval. */
IdleDetector.prototype.start = function() {
  if (this.interval) return;
  var self = this;
  this.interval = setInterval(function(){self.tick();}, this.pollTime);
  resume(self);
}

/** Stops the tick interval. */
IdleDetector.prototype.stop = function() {
  if (!this.interval) return;
  clearInterval(this.interval);
  this.interval = false;
}

IdleDetector.prototype.setIdleTime = function(idleTime) {
  this.idleTime = idleTime;
}

/** Polls the system idle time and cursor movement. */
IdleDetector.prototype.tick = function() {
  if (this.idleTime < 0) {
    if (!this.didResume) {
      resume(this, new Date());
      this.didResume = true;
    }
    return;
  }

  var date = new Date();
  var idleTime = -1;
  if (system) {
    try {
      idleTime = system.getIdleTime();
      // would work for pausing, not sure how to figure out exact time for resume
      //date = new Date(normTime - idleTime);
    } catch (e) {
      idleTime = -1;
    }
  }

  // fallback to cursor position
  if (idleTime < 0) {
    var oldCursorPos = this.cursorPos;
    this.cursorPos = electron.screen.getCursorScreenPoint();
    if (!oldCursorPos) return;

    // cursor moved
    if (Math.abs(oldCursorPos.x - this.cursorPos.x) > 0
        || Math.abs(oldCursorPos.y - this.cursorPos.y) > 0) {
        this.lastActive = normTime;
    }

    idleTime = date.getTime() - this.lastActive.getTime();
  }

  // call suspend if we've been chillin
  if (idleTime >= this.idleTime) suspend(this, date);
  else if (!this.running) resume(this, date);
}

module.exports = IdleDetector;
