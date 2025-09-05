let activeEffectScope;

class EffectScope {
    constructor(detached = false) {
        this.detached = detached; // 表示该作用域是否独立（不嵌套在父作用域中）
        this._active = true; //表示作用域是否激活
        this._on = 0; // 一个计数器，用于记录当前作用域被开启的次数（通过on方法）
        this.effects = []; // 存储属于该作用域的effect
        this.cleanups = []; // 存储清理函数，当作用域停止时会执行这些清理函数
        this._isPaused = false; // 表示作用域是否被暂停
        this.parent = undefined; //指向父作用域
        this.scopes = undefined; //存储嵌套的子作用域
        this.index = undefined; // 在父作用域的scopes数组中的索引
        this.prevScope = undefined; // 在调用 on 方法时，用于保存当前的activeEffectScope，以便在off时恢复
        this.parent = activeEffectScope;
        if (!detached && activeEffectScope) {
            this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
                this
            ) - 1;
        }
    }

    pause() {
        if (this._active) {
            this._isPaused = true;
            let i, l;
            if (this.scopes) {
                for (i = 0, l = this.scopes.length; i < l; i++) {
                    this.scopes[i].pause();
                }
            }
            for (i = 0, l = this.effects.length; i < l; i++) {
                this.effects[i].pause();
            }
        }
    }
    resume() {
        if (this._active) {
            if (this._isPaused) {
                this._isPaused = false;
                let i, l;
                if (this.scopes) {
                    for (i = 0, l = this.scopes.length; i < l; i++) {
                        this.scopes[i].resume();
                    }
                }
                for (i = 0, l = this.effects.length; i < l; i++) {
                    this.effects[i].resume();
                }
            }
        }
    }

    run(fn) {
        if (this._active) {
            const currentEffectScope = activeEffectScope;
            try {
                activeEffectScope = this;
                return fn();
            } finally {
                activeEffectScope = currentEffectScope;
            }
        }
    }

    on() {
        if (++this._on === 1) {
            this.prevScope = activeEffectScope;
            activeEffectScope = this;
        }
    }

    off() {
        if (this._on > 0 && --this._on === 0) {
            activeEffectScope = this.prevScope;
            this.prevScope = void 0;
        }
    }

    stop(fromParent) {
        if (this._active) {
            this._active = false;
            let i, l;
            for (i = 0, l = this.effects.length; i < l; i++) {
                this.effects[i].stop();
            }
            this.effects.length = 0;
            for (i = 0, l = this.cleanups.length; i < l; i++) {
                this.cleanups[i]();
            }
            this.cleanups.length = 0;
            if (this.scopes) {
                for (i = 0, l = this.scopes.length; i < l; i++) {
                    this.scopes[i].stop(true);
                }
                this.scopes.length = 0;
            }
            if (!this.detached && this.parent && !fromParent) {
                const last = this.parent.scopes.pop();
                if (last && last !== this) {
                    this.parent.scopes[this.index] = last;
                    last.index = this.index;
                }
            }
            this.parent = void 0;
        }
    }
}