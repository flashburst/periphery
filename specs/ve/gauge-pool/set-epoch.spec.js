const factory = require('../../util/factory')
const key = require('../../util/key')
const helper = require('../../util/helper')

require('chai')
  .use(require('chai-as-promised'))
  .should()

const DAYS = 86400

describe('Liquidity Gauge Pool: Set Epoch', () => {
  let contracts, info

  before(async () => {
    const [owner, , registry] = await ethers.getSigners()
    contracts = {}

    contracts.npm = await factory.deployUpgradeable('FakeToken', 'Fake Neptune Mutual Token', 'NPM')
    contracts.veToken = await factory.deployUpgradeable('VoteEscrowToken', owner.address, contracts.npm.address, owner.address, 'Vote Escrow Token', 'veToken')
    contracts.fakePod = await factory.deployUpgradeable('FakeToken', 'Yield Earning USDC', 'iUSDC-FOO')

    info = {
      key: key.toBytes32('foobar'),
      stakingToken: contracts.fakePod.address,
      veToken: contracts.veToken.address,
      rewardToken: contracts.npm.address,
      registry: registry.address,
      poolInfo: {
        name: 'Foobar',
        info: key.toBytes32('info'),
        epochDuration: 28 * DAYS,
        veBoostRatio: 1000,
        platformFee: helper.percentage(6.5),
        treasury: helper.randomAddress()
      }
    }

    contracts.gaugePool = await factory.deployUpgradeable('LiquidityGaugePool', info, owner.address, [])
  })

  it('must allow the registry to set the epoch', async () => {
    const [, , registry] = await ethers.getSigners()
    const rewards = helper.ether(10)

    await contracts.npm.mint(contracts.gaugePool.address, rewards)
    await contracts.gaugePool.connect(registry).setEpoch(1, 1000, rewards)
  })

  it('throws when epoch number is invalid', async () => {
    const [, , registry] = await ethers.getSigners()
    const rewards = helper.ether(10)

    await contracts.gaugePool.connect(registry).setEpoch(1, 1000, rewards)
      .should.be.revertedWithCustomError(contracts.gaugePool, 'InvalidArgumentError')
      .withArgs(key.toBytes32('epoch'))
  })

  it('throws when the balance is less than the rewards', async () => {
    const [, , registry] = await ethers.getSigners()
    const rewards = helper.ether(10)

    await contracts.gaugePool.connect(registry).setEpoch(2, 1000, rewards)
      .should.be.revertedWithCustomError(contracts.gaugePool, 'InsufficientDepositError')
  })

  it('throws when not accessed by the registry', async () => {
    const rewards = helper.ether(10)

    await contracts.gaugePool.setEpoch(1, 1 * DAYS, rewards)
      .should.be.revertedWithCustomError(contracts.gaugePool, 'AccessDeniedError')
      .withArgs(key.toBytes32('Registry'))
  })

  it('throws during reentrancy attack', async () => {
    const [owner, , registry] = await ethers.getSigners()
    const rewards = helper.ether(10)

    const npmToken = await factory.deployUpgradeable('FakeTokenWithReentrancy', key.toBytes32('setEpoch'))
    contracts.gaugePool = await factory.deployUpgradeable('LiquidityGaugePool', { ...info, rewardToken: npmToken.address }, owner.address, [])

    npmToken.setPool(contracts.gaugePool.address)

    await contracts.gaugePool.connect(registry).setEpoch(2, 1000, rewards)
      .should.be.rejectedWith('ReentrancyGuard: reentrant call')
  })
})
