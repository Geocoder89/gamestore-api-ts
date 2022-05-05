import config from 'config';
import NodeGeocoder from 'node-geocoder';

const options: NodeGeocoder.Options = {
  provider: "mapquest",
  apiKey: config.get<string>('geocoder_key'),
  httpAdapter: "https",
  formatter: null
};

const geocoder = NodeGeocoder(options)

export default geocoder