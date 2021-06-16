export interface SubNetwork {
  interfaces: number;
  letter: string;
}
export interface Network {
  ip: number[];
  mask: number;
}
export interface NetworkWithOrder extends Network {
  sizeOrderAsc?: boolean;
  alphabeticalOrderAsc?: boolean;
}
export interface NetworkWithSize extends Network {
  networkSize: number;
  letter: string;
}

export default class NetworkSolver implements Network {
  ip: number[];
  mask: number;
  sizeOrderAsc?: boolean;
  alphabeticalOrderAsc?: boolean;

  constructor({
    ip,
    mask,
    sizeOrderAsc = false,
    alphabeticalOrderAsc = true,
  }: NetworkWithOrder) {
    if (ip.length != 4) throw new RangeError("Wrong ip format");
    for (const octet of ip) {
      if (octet < 0 || octet > 255)
        throw new RangeError("Illegal Ip address value");
    }
    if (mask < 0 || mask > 32) throw new RangeError("Illegal mask value");
    this.ip = NetworkSolver.calculateNetAdress(ip, mask);
    this.mask = mask;
    this.sizeOrderAsc = sizeOrderAsc;
    this.alphabeticalOrderAsc = alphabeticalOrderAsc;
  }

  static calculateNetAdress = (ipAddress: number[], mask: number): number[] => {
    const octUntouched = mask / 8;
    const octBins = mask % 8;
    const networkAdress = ipAddress
      .slice(0, octUntouched)
      .concat(new Array(4 - octUntouched).fill(0));

    let leftMostBit = 128;
    for (let i = 0; i < octBins; i++) {
      if (leftMostBit & ipAddress[octUntouched])
        networkAdress[octUntouched] += leftMostBit;
      leftMostBit /= 2;
    }
    return networkAdress;
  };

  public binaryRepresentation = (): string => {
    const binaryStringArr: string[] = [];
    let counter = 0;
    for (const ip of this.ip) {
      let binaryString = "";
      for (let i = 7; i >= 0; i--) {
        if (Math.pow(2, i) & ip) binaryString += "1";
        else binaryString += "0";
        counter += 1;
        if (counter === this.mask) binaryString += "|";
      }
      binaryStringArr.push(binaryString);
    }
    return binaryStringArr.join(".");
  };
  private subNetworksSort = (
    subNetwork1: SubNetwork,
    subNetwork2: SubNetwork
  ): number => {
    if (subNetwork1.interfaces === subNetwork2.interfaces)
      return this.alphabeticalOrderAsc
        ? subNetwork1.letter.localeCompare(subNetwork2.letter)
        : subNetwork2.letter.localeCompare(subNetwork1.letter);

    return this.sizeOrderAsc
      ? subNetwork1.interfaces - subNetwork2.interfaces
      : subNetwork2.interfaces - subNetwork1.interfaces;
  };
  private nextIp = (ipAddress: number[], mask: number): number[] => {
    const currentIP = ipAddress;
    for (let i = mask; this.mask < mask; i--) {
      const mark = i % 8;
      const octet = i / 8;
      if (mark === 0 && (ipAddress[octet - 1] & 1) === 0) {
        currentIP[octet - 1] += 1;
        break;
      } else if (ipAddress[octet] & Math.pow(2, 8 - mark)) {
        currentIP[octet] += Math.pow(2, 8 - mark);
        break;
      }
    }

    return [];
  };

  public checkSubnetworks = (subNetworks: SubNetwork[]): NetworkWithSize[] => {
    const subNets = [...subNetworks].sort(this.subNetworksSort);
    let currentIP = this.ip;
    const ipAddressesMap: NetworkWithSize[] = [];
    for (let i = 0; i < subNets.length; i++) {
      const subNet = subNets[i];
      const pow2 = Math.ceil(Math.log2(subNet.interfaces + 2));
      const subNetworkObject: NetworkWithSize = {
        networkSize: Math.pow(2, pow2),
        mask: 32 - pow2,
        ip: currentIP,
        letter: subNet.letter,
      };

      currentIP = this.nextIp(currentIP, subNetworkObject.mask);

      if (currentIP === subNetworkObject.ip && i != subNets.length - 1)
        throw new Error(
          "Can't divide to that many subnets -> not enough interfaces"
        );

      ipAddressesMap.push(subNetworkObject);
    }
    return ipAddressesMap;
  };
}
