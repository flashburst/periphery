const { time } = require('@nomicfoundation/hardhat-network-helpers')
const factory = require('../../util/factory')
const helper = require('../../util/helper')
const DAYS = 86400
const WEEKS = 7 * DAYS
const MIN_LOCK_HEIGHT = 10

require('chai')
  .use(require('chai-as-promised'))
  .should()

describe('Vote Escrow Token: lock', () => {
  let contracts, name, symbol

  before(async () => {
    name = 'Vote Escrow Token'
    symbol = 'veToken'

    const [owner] = await ethers.getSigners()
    contracts = await factory.deployProtocol(owner)
    contracts.veToken = await factory.deployUpgradeable('VoteEscrowToken', owner.address, contracts.npm.address, owner.address, name, symbol)
  })

  it('must successfully lock NPM tokens', async () => {
    const [owner, bob] = await ethers.getSigners()
    const amounts = [helper.ether(20_000), helper.ether(50_000)]
    const durations = [10, 20]
    const heights = []
    const timestamps = []

    await contracts.npm.mint(owner.address, amounts[0])
    await contracts.npm.mint(bob.address, amounts[1])

    await contracts.npm.approve(contracts.veToken.address, amounts[0])
    await contracts.npm.connect(bob).approve(contracts.veToken.address, amounts[1])

    await contracts.veToken.lock(amounts[0], durations[0]).should.not.be.rejected
    heights.push(await ethers.provider.getBlockNumber())
    timestamps.push(await time.latest())

    await contracts.veToken.connect(bob).lock(amounts[1], durations[1]).should.not.be.rejected
    heights.push(await ethers.provider.getBlockNumber())
    timestamps.push(await time.latest())

    ;(await contracts.veToken._totalLocked()).should.equal(amounts[0] + amounts[1])

    ;(await contracts.veToken._balances(owner.address)).should.equal(amounts[0])
    ;(await contracts.veToken._unlockAt(owner.address)).should.equal(timestamps[0] + (durations[0] * WEEKS))
    ;(await contracts.veToken._minUnlockHeights(owner.address)).should.equal(heights[0] + MIN_LOCK_HEIGHT)

    ;(await contracts.veToken._balances(bob.address)).should.equal(amounts[1])
    ;(await contracts.veToken._unlockAt(bob.address)).should.equal(timestamps[1] + (durations[1] * WEEKS))
    ;(await contracts.veToken._minUnlockHeights(bob.address)).should.equal(heights[1] + MIN_LOCK_HEIGHT)
  })

  it('must not allow to lock NPM tokens when paused', async () => {
    const [, bob] = await ethers.getSigners()
    const amounts = [helper.ether(20_000), helper.ether(50_000)]
    const durations = [10, 20]

    // Set `bob` as pauser
    await contracts.veToken.setPausers([bob.address], [true])
    await contracts.veToken.connect(bob).pause()

    await contracts.veToken.lock(amounts[0], durations[0])
      .should.be.rejectedWith('Pausable: paused')

    await contracts.veToken.unpause()
    await contracts.veToken.setPausers([bob.address], [false])
  })
})
