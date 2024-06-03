/**
 * Name of the radiation database (DB): "PVGIS-SARAH2" for Europe, Africa and Asia or "PVGIS-NSRDB" for the Americas
 * between 60°N and 20°S,  "PVGIS-ERA5" and "PVGIS-COSMO" for Europe (including high-latitudes), and "PVGIS-CMSAF"
 * for Europe and Africa (will be deprecated).The default DBs are PVGIS-SARAH2, PVGIS-NSRDB and PVGIS-ERA5
 *  based on the chosen location.
 */
export enum PVGISRadiationDatabase {
  PVGIS_SARAH = 'PVGIS-SARAH',
  PVGIS_SARAH2 = 'PVGIS-SARAH2',
  PVGIS_NSRDB = 'PVGIS-NSRDB',
  PVGIS_ERA5 = 'PVGIS-ERA5',
  // removed from PVGIS 5.2 as per their documentation
  // PVGIS_COSMO = "PVGIS-COSMO",
  // PVGIS_CMSAF = "PVGIS-CMSAF"
}
