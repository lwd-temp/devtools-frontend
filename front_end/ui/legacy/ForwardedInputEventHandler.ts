// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import type * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';

import {Context} from './Context.js';
import {KeyboardShortcut} from './KeyboardShortcut.js';
import {ForwardedShortcut, ShortcutRegistry} from './ShortcutRegistry.js';

export class ForwardedInputEventHandler {
  constructor() {
    Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(
        Host.InspectorFrontendHostAPI.Events.KeyEventUnhandled, this.onKeyEventUnhandled, this);
  }

  private onKeyEventUnhandled(
      event: Common.EventTarget.EventTargetEvent<Host.InspectorFrontendHostAPI.KeyEventUnhandledEvent>): void {
    const {type, key, keyCode, modifiers} = event.data;
    if (type !== 'keydown') {
      return;
    }

    const context = Context.instance();
    const shortcutRegistry = ShortcutRegistry.instance();

    context.setFlavor(ForwardedShortcut, ForwardedShortcut.instance);
    shortcutRegistry.handleKey(KeyboardShortcut.makeKey(keyCode, modifiers), key);
    context.setFlavor(ForwardedShortcut, null);
  }
}

new ForwardedInputEventHandler();
