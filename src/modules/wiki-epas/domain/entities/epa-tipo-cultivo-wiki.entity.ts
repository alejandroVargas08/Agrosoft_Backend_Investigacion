interface EpaTipoCultivoWikiProps {
  epaId: number;
  tipoCultivoWikiId: number;
}

export class EpaTipoCultivoWiki {
  private constructor(private props: EpaTipoCultivoWikiProps) {}

  static crear(input: EpaTipoCultivoWikiProps): EpaTipoCultivoWiki {
    return new EpaTipoCultivoWiki(input);
  }

  static desdePersistencia(props: EpaTipoCultivoWikiProps): EpaTipoCultivoWiki {
    return new EpaTipoCultivoWiki(props);
  }

  get epaId() { return this.props.epaId; }
  get tipoCultivoWikiId() { return this.props.tipoCultivoWikiId; }

  toProps(): EpaTipoCultivoWikiProps { return { ...this.props }; }
}