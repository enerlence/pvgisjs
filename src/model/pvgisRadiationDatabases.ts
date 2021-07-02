/**
 * Name of the radiation database (DB): "PVGIS-SARAH" for Europe, Africa and Asia or "PVGIS-NSRDB" for the Americas
 * between 60°N and 20°S,  "PVGIS-ERA5" and "PVGIS-COSMO" for Europe (including high-latitudes), and "PVGIS-CMSAF"
 * for Europe and Africa (will be deprecated).The default DBs are PVGIS-SARAH, PVGIS-NSRDB and PVGIS-ERA5
 *  based on the chosen location.
 */
export enum PVGISRadiationDatabase {
  PVGIS_SARAH = 'PVGIS-SARAH',
  PVGIS_NSRDB = 'PVGIS-NSRDB',
  PVGIS_ERA5 = 'PVGIS-ERA5',
  PVGIS_COSMO = 'PVGIS-COSMO',
  PVGIS_CMSAF = 'PVGIS-CMSAF',
}
