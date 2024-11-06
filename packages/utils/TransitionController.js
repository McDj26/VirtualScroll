export default class TransitionController {
  #currentVal

  #startVal
  #startTime
  #targetVal
  #duration
  #transitionFn
  #executor
  #callback
  #timingFn

  #nextIdentifier = 0
  #taskIdentifier

  constructor(currentVal = 0) {
    this.#currentVal = currentVal
    this.#executor = undefined
    this.#transitionFn = () => {
      let progress = Math.min(
        (Date.now() - this.#startTime) / this.#duration,
        1,
      )
      this.#currentVal = this.#timingFn(
        this.#startVal,
        this.#targetVal,
        progress,
      )
      this.#callback?.(this.#currentVal, progress)
      if (progress < 1) {
        this.#executor = requestAnimationFrame(this.#transitionFn)
      } else {
        this.#executor = undefined
        this.#taskIdentifier = 0
      }
    }
    this.#taskIdentifier = 0
  }

  /**
   * 执行线性过渡
   * @param {number} targetVal 目标数
   * @param {(currentVal: number, progress: number)} callback 回调函数
   * @param {number} duration 持续时间
   * @param {number} startVal 开始时间
   * @param {(startVal: number, endVal: number, progress: number) => number} timingFn 过渡曲线
   * @returns {number}
   */
  addTask(
    targetVal,
    callback = undefined,
    duration = 500,
    startVal = undefined,
    timingFn = undefined,
  ) {
    this.#targetVal = targetVal
    this.#duration = Math.abs(duration)
    this.#callback = callback
    this.#startVal = startVal !== undefined ? startVal : this.#currentVal
    this.#startTime = Date.now()
    this.#timingFn = timingFn || TransitionController.Linear
    this.cancelTask()
    this.#executor = requestAnimationFrame(this.#transitionFn)
    this.#taskIdentifier = this.#nextIdentifier =
      ((this.#nextIdentifier + 1) % 100000) + 1

    return this.#taskIdentifier
  }

  /**
   * @param {(startVal: number, endVal: number, progress: number) => number} getNewTargetVal
   */
  updateTargetValue(getNewTargetVal) {
    this.#targetVal = getNewTargetVal(
      this.#startVal,
      this.#targetVal,
      Math.min(1, (Date.now() - this.#startTime) / this.#duration),
    )
    this.#startVal = this.#currentVal
    this.#startTime = Date.now()
  }

  /**
   * @returns {number | undefined}
   */
  get taskId() {
    return this.#taskIdentifier || undefined
  }

  cancelTask() {
    if (this.#executor) {
      cancelAnimationFrame(this.#executor)
      this.#executor = undefined
      this.#taskIdentifier = 0
    }
  }

  /**
   * 线性速度
   */
  static Linear(start, end, progress) {
    return start + (end - start) * progress
  }

  /**
   * 三角形速度
   */
  static TriangleVelocity(start, end, progress) {
    return progress <= 0.5
      ? start + (end - start) * 2 * progress ** 2
      : start + (end - start) * (-2 * progress ** 2 + 4 * progress - 1)
  }

  /**
   * 线性递减速度
   */
  static Quadratic(start, end, progress) {
    return end - (end - start) * (progress - 1) ** 2
  }
}
